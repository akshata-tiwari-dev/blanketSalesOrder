/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define(["require", "exports", "N/query", "N/log", "N/record"], function (require, exports, query, log, record) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reduce = exports.map = exports.getInputData = void 0;
    query = __importStar(query);
    log = __importStar(log);
    record = __importStar(record);
    // ===================== Utility =====================
    /**
     * Converts a Date to YYYY-MM-DD format
     * @param d - Date object
     * @returns formatted string
     */
    function formatDate(d) {
        return d.toISOString().split('T')[0];
    }
    // ===================== getInputData =====================
    /**
     * Fetches all schedule records with today's date and approved BSO
     */
    const getInputData = () => {
        try {
            const today = new Date();
            const isoToday = today.toISOString().split('T')[0];
            const queryString = `
            SELECT
                sch.id                     AS schedule_id,
                sch.custrecordstdate       AS release_date,
                sch.custrecordqtyy         AS quantity,
                items.id                   AS item_line_id,
                items.custrecord_itemid    AS item_id,
                items.custrecord_rate      AS rate,
                bso.custrecord_loc         AS location,
                bso.id                     AS bso_id,
                bso.custrecord_customer    AS customer_id,
                bso.custrecord_memo        AS bso_memo
            FROM customrecord_schedule sch
                     JOIN customrecord_item items
                          ON sch.custrecord_schsublink = items.id
                     JOIN customrecord_bso bso
                          ON items.custrecord_bso_item_sublist_link = bso.id
            WHERE TO_CHAR(sch.custrecordstdate, 'YYYY-MM-DD') = '${isoToday}'
              AND bso.custrecord127 = 1
        `;
            log.audit('Query Executed', queryString);
            const resultSet = query.runSuiteQL({ query: queryString });
            const results = resultSet.asMappedResults();
            log.audit('SuiteQL Result Count', results.length);
            if (results.length > 0) {
                log.debug('First Result Sample', JSON.stringify(results[0]));
                return results.map(result => JSON.stringify(result));
            }
            log.audit('No Results Found', 'SuiteQL returned 0 rows');
            return [];
        }
        catch (e) {
            log.error('SuiteQL Error', e.message);
            return [];
        }
    };
    exports.getInputData = getInputData;
    // ===================== Map =====================
    /**
     * Groups each schedule entry by customer
     */
    const map = (context) => {
        const data = JSON.parse(context.value);
        const scheduleId = data.schedule_id;
        const releaseDate = formatDate(new Date(data.release_date));
        const today = formatDate(new Date());
        if (releaseDate === today) {
            log.audit('Today Match', `Schedule ID ${scheduleId} — Release Date: ${releaseDate}, Today: ${today}`);
        }
        else {
            log.audit('Not Today', `Schedule ID ${scheduleId} — Release Date: ${releaseDate}, Today: ${today}`);
        }
        context.write({
            key: data.customer_id,
            value: JSON.stringify(data)
        });
    };
    exports.map = map;
    // ===================== Reduce =====================
    /**
     * For each customer, creates a sales order with scheduled items
     */
    const reduce = (context) => {
        const customerId = context.key;
        const items = context.values.map(val => JSON.parse(val));
        log.audit('Creating Sales Order for Customer', customerId);
        let salesOrderId;
        try {
            const salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });
            salesOrder.setValue({ fieldId: 'entity', value: parseInt(customerId) });
            salesOrder.setValue({ fieldId: 'trandate', value: new Date(items[0].release_date) });
            salesOrder.setValue({ fieldId: 'custbodyiscreated', value: true });
            salesOrder.setValue({ fieldId: 'memo', value: items[0].bso_memo || 'Auto-generated SO' });
            // Optional: Email configuration
            try {
                const customerRec = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerId
                });
                const emailTo = customerRec.getValue({ fieldId: 'email' });
                if (emailTo) {
                    salesOrder.setValue({ fieldId: 'email', value: emailTo });
                    salesOrder.setValue({ fieldId: 'tobeemailed', value: true });
                }
                else {
                    log.audit('No email on customer — skipping tobeemailed', `Customer ID: ${customerId}`);
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    log.error('Customer email fetch failed', e.message);
                }
                else {
                    log.error('Customer email fetch failed', JSON.stringify(e));
                }
            }
            // Add items to the sales order
            for (const entry of items) {
                salesOrder.selectNewLine({ sublistId: 'item' });
                const safeRate = entry.rate && !isNaN(entry.rate) ? Number(entry.rate) : 0;
                salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: entry.item_id });
                salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: entry.quantity });
                salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: safeRate });
                salesOrder.commitLine({ sublistId: 'item' });
            }
            // Save and log
            salesOrderId = salesOrder.save();
            log.audit('Sales Order Created', `Customer: ${customerId}, ID: ${salesOrderId}`);
            // Link each schedule to this SO
            for (const entry of items) {
                if (entry.schedule_id) {
                    record.submitFields({
                        type: 'customrecord_schedule',
                        id: entry.schedule_id,
                        values: {
                            custrecord_so_link: salesOrderId
                        }
                    });
                    log.audit('Schedule Updated', `Schedule ID ${entry.schedule_id} linked to SO ID ${salesOrderId}`);
                }
            }
        }
        catch (e) {
            log.error(`SO creation failed for Customer ${customerId}`, e.message);
        }
    };
    exports.reduce = reduce;
});

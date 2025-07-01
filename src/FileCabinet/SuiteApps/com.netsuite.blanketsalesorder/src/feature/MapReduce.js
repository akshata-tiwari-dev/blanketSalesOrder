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
    exports.map = exports.getInputData = void 0;
    query = __importStar(query);
    log = __importStar(log);
    record = __importStar(record);
    function formatDate(d) {
        return d.toISOString().split('T')[0];
    }
    const getInputData = () => {
        try {
            const today = new Date();
            const isoToday = today.toISOString().split('T')[0];
            const queryString = `
            SELECT
                bso.custrecord_orderid AS schedule_id,
                sch.custrecordstdate AS release_date,
                sch.custrecordqtyy AS quantity,
                items.id AS item_line_id,
                items.custrecord_itemid AS item_id,
                items.custrecord_rate AS rate,
                bso.custrecord_loc AS location,
                bso.id AS bso_id,
                bso.custrecord_customer AS customer_id
            FROM customrecord_schedule sch
            JOIN customrecord_item items ON sch.custrecord_sched_sched_code = items.custrecord_itemid
            JOIN customrecord_bso bso ON items.custrecord_bso_item_sublist_link = bso.id
            WHERE TO_CHAR(sch.custrecordstdate, 'YYYY-MM-DD') = '${isoToday}'
        `;
            log.audit('Query Executed', queryString);
            const resultSet = query.runSuiteQL({ query: queryString });
            const results = resultSet.asMappedResults();
            log.audit('SuiteQL Result Count', results.length);
            if (results.length > 0) {
                log.debug('First Result Sample', JSON.stringify(results[0]));
                return results.map(JSON.stringify); // Required for map() to trigger
            }
            else {
                log.audit('No Results Found', 'SuiteQL returned 0 rows');
                return [];
            }
        }
        catch (e) {
            log.error('SuiteQL Error', e.message);
            return [];
        }
    };
    exports.getInputData = getInputData;
    const map = (context) => {
        log.audit('MAP INVOKED', context.value);
        const data = JSON.parse(context.value);
        const releaseDate = data.release_date;
        const quantity = data.quantity;
        const scheduleId = data.schedule_id;
        const itemId = data.item_id;
        const customerId = data.customer_id;
        const rate = data.rate;
        const amount = rate * quantity;
        const locationId = data.location;
        const today = formatDate(new Date());
        const release = formatDate(new Date(releaseDate));
        log.debug('Date Check', `ReleaseDate: ${release}, Today: ${today}`);
        log.audit('Today Match', `Schedule ID ${scheduleId} is due today with quantity ${quantity}`);
        try {
            const salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });
            salesOrder.setValue({ fieldId: 'entity', value: customerId });
            salesOrder.setValue({ fieldId: 'trandate', value: new Date(releaseDate) });
            // salesOrder.setValue({ fieldId: 'location', value: locationId }); // Enable only if valid
            salesOrder.setValue({ fieldId: 'otherrefnum', value: scheduleId });
            salesOrder.setValue({ fieldId: 'custbodyiscreated', value: true });
            salesOrder.selectNewLine({ sublistId: 'item' });
            salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: itemId });
            salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: quantity });
            salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rate });
            salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: amount });
            salesOrder.commitLine({ sublistId: 'item' });
            const salesOrderId = salesOrder.save();
            log.audit('Sales Order Created', `ID: ${salesOrderId} for Schedule ID ${scheduleId}`);
        }
        catch (e) {
            log.error({
                title: `Sales Order Creation Failed for Schedule ID ${scheduleId}`,
                details: e.message
            });
        }
    };
    exports.map = map;
});

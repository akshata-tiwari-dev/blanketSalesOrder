
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

// Importing relevant modules
import {EntryPoints} from 'N/types';
import * as query from 'N/query';
import * as log from 'N/log';
import * as record from 'N/record';
import * as email from 'N/email';
import * as runtime from 'N/runtime';

// Format date to YYYY-MM-DD
function formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
}

// Input stage: Get records matching today's date and approved status
export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        const today = new Date();
        const isoToday = today.toISOString().split('T')[0];

        const queryString = `
            SELECT sch.id                  AS schedule_id,
                   sch.custrecordstdate    AS release_date,
                   sch.custrecordqtyy      AS quantity,
                   items.id                AS item_line_id,
                   items.custrecord_itemid AS item_id,
                   items.custrecord_rate   AS rate,
                   bso.custrecord_loc      AS location,
                   bso.id                  AS bso_id,
                   bso.custrecord_customer AS customer_id
            FROM customrecord_schedule sch
                     JOIN customrecord_item items ON sch.custrecord_schsublink = items.id
                     JOIN customrecord_bso bso ON items.custrecord_bso_item_sublist_link = bso.id
            WHERE TO_CHAR(sch.custrecordstdate, 'YYYY-MM-DD') = '${isoToday}'
              AND bso.custrecord127 = 1
        `;

        log.audit('Query Executed', queryString);

        const resultSet = query.runSuiteQL({query: queryString});
        const results = resultSet.asMappedResults();

        log.audit('SuiteQL Result Count', results.length);

        if (results.length > 0) {
            log.debug('First Result Sample', JSON.stringify(results[0]));
            return results.map(result => JSON.stringify(result));
        } else {
            log.audit('No Results Found', 'SuiteQL returned 0 rows');
            return [];
        }
    } catch (e: any) {
        log.error('SuiteQL Error', e.message);
        return [];
    }
};

// Map stage: Group by customer ID
export const map: EntryPoints.MapReduce.map = (context) => {
    const data = JSON.parse(context.value);

    const scheduleId = data.schedule_id;
    const releaseDate = formatDate(new Date(data.release_date));
    const today = formatDate(new Date());

    if (releaseDate === today) {
        log.audit('Today Match', `Schedule ID ${scheduleId} — Release Date: ${releaseDate}, Today: ${today}`);
    } else {
        log.audit('Not Today', `Schedule ID ${scheduleId} — Release Date: ${releaseDate}, Today: ${today}`);
    }

    context.write({
        key: data.customer_id,
        value: JSON.stringify(data)
    });
};

// Reduce stage: Create sales order per customer
export const reduce: EntryPoints.MapReduce.reduce = (context) => {
    const customerId = context.key;
    const items = context.values.map(val => JSON.parse(val));

    log.audit('Creating Sales Order for Customer', customerId);

    let salesOrderId: string | number;

    try {
        const salesOrder = record.create({
            type: record.Type.SALES_ORDER,
            isDynamic: true
        });

        salesOrder.setValue({fieldId: 'entity', value: parseInt(customerId)});
        salesOrder.setValue({fieldId: 'trandate', value: new Date(items[0].release_date)});
        salesOrder.setValue({fieldId: 'custbodyiscreated', value: true});
        // salesOrder.setValue({fieldId: 'tobeemailed', value: true});

        try {
            const customerRec = record.load({
                type: record.Type.CUSTOMER,
                id: customerId
            });

            const emailTo = customerRec.getValue({ fieldId: 'email' });

            if (emailTo) {
                salesOrder.setValue({ fieldId: 'email', value: emailTo });
                salesOrder.setValue({ fieldId: 'tobeemailed', value: true });
            } else {
                log.audit('No email on customer — skipping tobeemailed', `Customer ID: ${customerId}`);
            }

        } catch (e) {
            log.error('Customer email fetch failed', e.message);
        }



        for (const entry of items) {
            salesOrder.selectNewLine({sublistId: 'item'});

            const safeRate = entry.rate && !isNaN(entry.rate) ? Number(entry.rate) : 0;

            salesOrder.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: entry.item_id});
            salesOrder.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: entry.quantity});
            salesOrder.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: safeRate});

            salesOrder.commitLine({sublistId: 'item'});
        }

        salesOrderId = salesOrder.save();
        log.audit('Sales Order Created', `Customer: ${customerId}, ID: ${salesOrderId}`);

        // Link schedule records to the created Sales Order
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


    } catch (e: any) {
        log.error(`SO creation failed for Customer ${customerId}`, e.message);
    }
};

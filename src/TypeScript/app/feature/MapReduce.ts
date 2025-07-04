/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

import { EntryPoints } from 'N/types';
import * as query from 'N/query';
import * as log from 'N/log';
import * as record from 'N/record';

function formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
}

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        const today = new Date();
        const isoToday = today.toISOString().split('T')[0];

        const queryString = `
            SELECT
sch.id AS schedule_id,
                sch.custrecordstdate AS release_date,
                sch.custrecordqtyy AS quantity,
                items.id AS item_line_id,
                items.custrecord_itemid AS item_id,
                items.custrecord_rate AS rate,
                bso.custrecord_loc AS location,
                bso.id AS bso_id,
                bso.custrecord_customer AS customer_id
            FROM customrecord_schedule sch
            JOIN customrecord_item items ON sch.custrecord_schsublink = items.id
            JOIN customrecord_bso bso ON items.custrecord_bso_item_sublist_link = bso.id
            WHERE TO_CHAR(sch.custrecordstdate, 'YYYY-MM-DD') = '${isoToday}'
        `;

        log.audit('Query Executed', queryString);

        const resultSet = query.runSuiteQL({ query: queryString });
        const results = resultSet.asMappedResults();

        log.audit('SuiteQL Result Count', results.length);

        if (results.length > 0) {
            log.debug('First Result Sample', JSON.stringify(results[0]));
            return results.map(result => JSON.stringify(result)); //used shorthand b4 but jest case failed
        } else {
            log.audit('No Results Found', 'SuiteQL returned 0 rows');
            return [];
        }
    } catch (e: any) {
        log.error('SuiteQL Error', e.message);
        return [];
    }
};

export const map: EntryPoints.MapReduce.map = (context) => {
    log.audit('MAP INVOKED', context.value);

    const data = JSON.parse(context.value) as {

        release_date: string;
        quantity: number;
        item_id: number;
        customer_id: number;
        rate: number;
        location: number;
        schedule_id: string;
    };
    // schedule_id: string;

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
        // salesOrder.setValue({ fieldId: 'location', value: locationId });
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

    } catch (e: any) {
        log.error({
            title: `Sales Order Creation Failed for Schedule ID ${scheduleId}`,
            details: e.message
        });
    }
};

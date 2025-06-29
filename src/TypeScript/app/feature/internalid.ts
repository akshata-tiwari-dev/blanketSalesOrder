/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as log from 'N/log';

export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (context) => {
    if (context.type !== context.UserEventType.CREATE) return;

    const newRecord = context.newRecord;
    const recId = newRecord.id;

    try {
        const rec = record.load({
            type: 'customrecord606', // Your ITEMS record type
            id: recId
        });

        rec.setValue({
            fieldId: 'custrecord_line_internal_id',
            value: recId.toString()
        });

        rec.save();

        log.debug({
            title: 'Line ID saved',
            details: 'ID: ' + recId
        });

    } catch (e: any) {
        log.error({
            title: 'Failed to update line internal ID',
            details: e.message || e
        });
    }
};

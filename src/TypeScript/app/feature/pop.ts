/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet

 */

import { EntryPoints } from 'N/types';
import * as serverWidget from 'N/ui/serverWidget';
import * as runtime from 'N/runtime';
export const onRequest: EntryPoints.Suitelet.onRequest = (context) => {
    const request = context.request;
    const response = context.response;
    const form = serverWidget.createForm({
        title: 'Schedule',
    });
    // Add buttons
    form.addButton({
        id: 'custpage_auto_generate',
        label: 'Auto Generate',
        functionName: 'autoGenerateSchedule'
    });
    form.clientScriptModulePath = './CS_AutoGenerateSchedule.js';
    // Sublist
    const sublist = form.addSublist({
        id: 'custpage_schedule_sublist',
        type: serverWidget.SublistType.LIST,
        label: 'Schedule'
    });
    sublist.addField({
        id: 'custpage_order',
        label: 'Order',
        type: serverWidget.FieldType.TEXT
    });
    sublist.addField({
        id: 'custpage_date',
        label: 'Date',
        type: serverWidget.FieldType.DATE
    });
    // Auto-populate values if flag present
    if (request.method === 'GET' && request.parameters.autogenerate === 'true') {
        const today = new Date();
        var need=
        for (let i = 0; i < 5; i++) {
            const nextDate = new Date(today);
            nextDate.setMonth(today.getMonth() + i);
            sublist.setSublistValue({
                id: 'custpage_order',
                line: i,
                value: `ORD-${i + 1}`
            });
            sublist.setSublistValue({
                id: 'custpage_date',
                line: i,
                value: nextDate.toISOString().split('T')[0]
            });
        }
    }
    response.writePage(form);
};
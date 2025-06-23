/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet

 */

import serverWidget from 'N/ui/serverWidget';
import { EntryPoints } from 'N/types';
function onRequest(context: { request: { method: string; parameters: { [key: string]: string; }; }; response: { writePage: (form: any) => void; write: (message: string) => void; }; }) {
    if (context.request.method === 'GET') {
        const form = serverWidget.createForm({ title: 'Schedule' });

        const startDateField = form.addField({
            id: 'custpage_start_date',
            label: 'Start Date',
            type: serverWidget.FieldType.DATE
        });
        const endDateField = form.addField({
            id: 'custpage_end_date',
            label: 'End Date',
            type: serverWidget.FieldType.DATE
        });
        const qtyField = form.addField({
            id: 'custpage_quantity',
            label: 'Quantity',
            type: serverWidget.FieldType.INTEGER
        });
        // Sublist
        const sublist = form.addSublist({
            id: 'custpage_schedule_sublist',
            label: 'Schedule',
            type: serverWidget.SublistType.INLINEEDITOR
        });
        sublist.addField({
            id: 'custpage_release_date',
            label: 'Release Date',
            type: serverWidget.FieldType.DATE
        });
        sublist.addField({
            id: 'custpage_release_qty',
            label: 'Quantity',
            type: serverWidget.FieldType.INTEGER
        });
        // Buttons
        form.addSubmitButton({ label: 'Save Data' });
        form.addButton({
            id: 'custpage_auto_generate',
            label: 'Auto Generate',
            functionName: 'autoGenerateSchedule'
        });
        // Client Script
        form.clientScriptModulePath = './stsutogen.js'; // Create separate Client Script file
        context.response.writePage(form);
    } else {
        const delimiter = /\u0001/;
        const textField = context.request.parameters.custpage_text;
        const dateField = context.request.parameters.custpage_date;
        const currencyField = context.request.parameters.custpage_currencyfield;
        const selectField = context.request.parameters.custpage_selectfield;
        const sublistData = context.request.parameters.sublistdata.split(delimiter);
        const sublistField1 = sublistData[0];
        const sublistField2 = sublistData[1];

        context.response.write('You have entered: ' + textField + ' ' + dateField + ' '
            + currencyField + ' ' + selectField + ' ' + sublistField1 + ' ' + sublistField2);
    }
    }
}

export = {
    onRequest: onRequest,
    //autoGenerateSchedule:autoGenerateSchedule
};
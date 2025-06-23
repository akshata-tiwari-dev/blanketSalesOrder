/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet

 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/ui/serverWidget"], function (require, exports, serverWidget_1) {
    "use strict";
    serverWidget_1 = __importDefault(serverWidget_1);
    function onRequest(context) {
        if (context.request.method === 'GET') {
            const form = serverWidget_1.default.createForm({ title: 'Schedule' });
            const startDateField = form.addField({
                id: 'custpage_start_date',
                label: 'Start Date',
                type: serverWidget_1.default.FieldType.DATE
            });
            const endDateField = form.addField({
                id: 'custpage_end_date',
                label: 'End Date',
                type: serverWidget_1.default.FieldType.DATE
            });
            const qtyField = form.addField({
                id: 'custpage_quantity',
                label: 'Quantity',
                type: serverWidget_1.default.FieldType.INTEGER
            });
            // Sublist
            const sublist = form.addSublist({
                id: 'custpage_schedule_sublist',
                label: 'Schedule',
                type: serverWidget_1.default.SublistType.INLINEEDITOR
            });
            sublist.addField({
                id: 'custpage_release_date',
                label: 'Release Date',
                type: serverWidget_1.default.FieldType.DATE
            });
            sublist.addField({
                id: 'custpage_release_qty',
                label: 'Quantity',
                type: serverWidget_1.default.FieldType.INTEGER
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
        }
        else {
            const delimiter = /\u0001/;
            const textField = context.request.parameters.custpage_text;
            const dateField = context.request.parameters.custpage_date;
            const currencyField = context.request.parameters.custpage_currencyfield;
            const selectField = context.request.parameters.custpage_selectfield;
            const rawSublistData = context.request.parameters.sublistdata || '';
            const sublistData = rawSublistData.split(delimiter);
            const sublistField1 = sublistData[0] || '';
            const sublistField2 = sublistData[1] || '';
            context.response.write('You have entered: ' + textField + ' ' + dateField + ' ' + currencyField + ' ' + selectField + ' ' + sublistField1 + ' ' + sublistField2);
        }
    }
    return {
        onRequest: onRequest,
        //autoGenerateSchedule:autoGenerateSchedule
    };
});

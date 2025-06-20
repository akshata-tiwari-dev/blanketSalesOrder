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
            const form = serverWidget_1.default.createForm({ title: 'Blanket Purchase Order' });
            // Primary Information Group
            form.addFieldGroup({
                id: 'primaryinfo',
                label: 'Primary Information'
            });
            form.addField({
                id: 'custpage_blanket_po_num',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'Blanket PO #',
                container: 'primaryinfo'
            });
            form.addField({
                id: 'custpage_vendor',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'Vendor',
                source: 'vendor',
                container: 'primaryinfo'
            }).isMandatory = true;
            form.addField({
                id: 'custpage_employee',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'Employee',
                source: 'employee',
                container: 'primaryinfo'
            }).isMandatory = true;
            form.addField({
                id: 'custpage_date',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'Date',
                container: 'primaryinfo'
            }).defaultValue = new Date().toISOString().split('T')[0]; // Today's Date
            form.getField({ id: 'custpage_date' }).isMandatory = true;
            form.addField({
                id: 'custpage_start_date',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'Start Date',
                container: 'primaryinfo'
            }).isMandatory = true;
            form.addField({
                id: 'custpage_end_date',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'End Date',
                container: 'primaryinfo'
            });
            form.addField({
                id: 'custpage_max_amt',
                type: serverWidget_1.default.FieldType.CURRENCY,
                label: 'Maximum Amount',
                container: 'primaryinfo'
            });
            form.addField({
                id: 'custpage_memo',
                type: serverWidget_1.default.FieldType.TEXTAREA,
                label: 'Memo',
                container: 'primaryinfo'
            });
            /* if (context.request.method === 'GET') {
        
                const form = serverWidget.createForm({
                    title: 'Create BSO'
                });
                const fieldgroup = form.addFieldGroup({
                    id : 'fieldgroupid',
                    label : 'Primary Information'
                });
                const select = form.addField({
                    id: 'custpage_selectfield',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Order Type'
                });
        
                select.addSelectOption({
                    value: 'a',
                    text: 'BL'
                });
        
                select.addSelectOption({
                    value: 'b',
                    text: 'AL'
                });
                const field = form.addField({
                    id: 'order_no',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Order Number'
                });
                const st = form.addField({
                    id: 'start_',
                    type: serverWidget.FieldType.DATE,
                    label: 'Start Date'
                });
                const end = form.addField({
                    id: 'end_',
                    type: serverWidget.FieldType.DATE,
                    label: 'End Date'
                });
                const status = form.addField({
                    id: 'status_',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Status'
                });
                status.addSelectOption({
                    value: 'a',
                    text: 'Pending'
                });
                status.addSelectOption({
                    value: 'b',
                    text: 'Completed'
                });
        
        
        
                field.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
        
        
        
        
        
                const sublist = form.addSublist({
                    id: 'sublist_',
                    type: serverWidget.SublistType.INLINEEDITOR,
                    label: 'Order Details'
                });
                sublist.addField({
                    id: 'inven',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Inventory ID'
                });
                sublist.addField({
                    id: 'itname',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item Name'
                });
        
        sublist.addField({
                    id: 'qn',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Quantity'
                });
                sublist.addField({
                    id: 'qty',
                    type: serverWidget.FieldType.TEXT,
                    label: 'QON'
                });
                sublist.addField({
                    id: 'boq',
                    type: serverWidget.FieldType.TEXT,
                    label: 'BOQ'
                });/*
                sublist.addField({
                    id: 'Sc_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Scheduled Date'
                });
                sublist.addField({
                    id: 'rel_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Release Date'
                });
        /*
        
                sublist.addField({
                    id: 'boq',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Blanket Open Quantity'
                });
                sublist.addField({
                    id: 'Sc_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Scheduled Date'
                });
                sublist.addField({
                    id: 'rel_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Release Date'
                });
        
        */
            form.addSubmitButton({
                label: 'Submit Button'
            });
            context.response.writePage(form);
        }
        else {
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
    return {
        onRequest: onRequest
    };
});

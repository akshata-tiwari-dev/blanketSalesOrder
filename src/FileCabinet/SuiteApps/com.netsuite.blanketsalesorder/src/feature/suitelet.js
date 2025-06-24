/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/ui/serverWidget", "N/log"], function (require, exports, serverWidget_1, log) {
    "use strict";
    serverWidget_1 = __importDefault(serverWidget_1);
    log = __importStar(log);
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
            form.clientScriptModulePath = './stsutogen.js';
            context.response.writePage(form);
        }
        else {
            log.debug(context.request.method);
            /*
            const delimiter: RegExp = /\u0001/;
            const textField = context.request.parameters.custpage_text;
            const dateField = context.request.parameters.custpage_date;
            const currencyField = context.request.parameters.custpage_currencyfield;
            const selectField = context.request.parameters.custpage_selectfield;
            const rawSublistData = context.request.parameters.sublistdata || '';
            const sublistData = rawSublistData.split(delimiter);
            const sublistField1 = sublistData[0] || '';
            const sublistField2 = sublistData[1] || '';
            context.response.write('You have entered: ' + textField + ' ' + dateField + ' ' + currencyField + ' ' + selectField + ' ' + sublistField1 + ' ' + sublistField2);
        }*/
        }
    }
    return {
        onRequest: onRequest,
        //autoGenerateSchedule:autoGenerateSchedule
    };
});

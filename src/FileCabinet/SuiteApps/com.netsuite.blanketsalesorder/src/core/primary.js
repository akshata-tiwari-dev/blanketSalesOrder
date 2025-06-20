/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
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
define(["require", "exports", "N/ui/serverWidget", "N/log"], function (require, exports, serverWidget, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    serverWidget = __importStar(serverWidget);
    log = __importStar(log);
    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            const form = serverWidget.createForm({ title: 'Blanket Purchase Order' });
            // Primary Information Group
            form.addFieldGroup({
                id: 'primaryinfo',
                label: 'Primary Information'
            });
            form.addField({
                id: 'custpage_blanket_po_num',
                type: serverWidget.FieldType.TEXT,
                label: 'Blanket PO #',
                container: 'primaryinfo'
            });
            form.addField({
                id: 'custpage_vendor',
                type: serverWidget.FieldType.SELECT,
                label: 'Vendor',
                source: 'vendor',
                container: 'primaryinfo'
            }).isMandatory = true;
            form.addField({
                id: 'custpage_employee',
                type: serverWidget.FieldType.SELECT,
                label: 'Employee',
                source: 'employee',
                container: 'primaryinfo'
            }).isMandatory = true;
            form.addField({
                id: 'custpage_date',
                type: serverWidget.FieldType.DATE,
                label: 'Date',
                container: 'primaryinfo'
            }).defaultValue = new Date().toISOString().split('T')[0]; // Today's Date
            form.getField({ id: 'custpage_date' }).isMandatory = true;
            form.addField({
                id: 'custpage_start_date',
                type: serverWidget.FieldType.DATE,
                label: 'Start Date',
                container: 'primaryinfo'
            }).isMandatory = true;
            form.addField({
                id: 'custpage_end_date',
                type: serverWidget.FieldType.DATE,
                label: 'End Date',
                container: 'primaryinfo'
            });
            form.addField({
                id: 'custpage_max_amt',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Maximum Amount',
                container: 'primaryinfo'
            });
            form.addField({
                id: 'custpage_memo',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'Memo',
                container: 'primaryinfo'
            });
            /*
            
                    form.addField({
                        id: 'custpage_summary',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Summary'
                    }).defaultValue = summaryHtml;*/
            form.addSubmitButton({ label: 'Save' });
            form.addButton({
                id: 'custpage_cancel',
                label: 'Cancel',
                functionName: 'history.back()'
            });
            form.clientScriptModulePath = './blanket_po_cs.js'; // Optional Client Script
            context.response.writePage(form);
        }
        else if (context.request.method === 'POST') {
            const req = context.request;
            const blanketNumber = req.parameters['custpage_blanket_po_num'] || '';
            const vendorId = req.parameters['custpage_vendor'] || '';
            const employeeId = req.parameters['custpage_employee'] || '';
            const date = req.parameters['custpage_date'] || '';
            const startDate = req.parameters['custpage_start_date'] || '';
            const endDate = req.parameters['custpage_end_date'] || '';
            const maxAmount = req.parameters['custpage_max_amt'] || '';
            const memo = req.parameters['custpage_memo'] || '';
            log.audit('Blanket PO Submitted', {
                blanketNumber,
                vendorId,
                employeeId,
                date,
                startDate,
                endDate,
                maxAmount,
                memo
            });
            context.response.write('Blanket Purchase Order Saved Successfully!');
        }
    };
    exports.onRequest = onRequest;
});

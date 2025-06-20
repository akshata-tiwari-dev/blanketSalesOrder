/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

import * as serverWidget from 'N/ui/serverWidget';
import * as record from 'N/record';
import * as log from 'N/log';
import { EntryPoints } from 'N/types';

export const onRequest: EntryPoints.Suitelet.onRequest = (context) => {

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

        form.getField({ id: 'custpage_date' })!.isMandatory = true;

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

    } else if (context.request.method === 'POST') {
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

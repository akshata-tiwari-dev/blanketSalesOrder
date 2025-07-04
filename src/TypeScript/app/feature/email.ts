/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

import * as email from 'N/email';
import * as runtime from 'N/runtime';
import * as record from 'N/record';
import * as log from 'N/log';
import { EntryPoints } from 'N/types';

export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (context) => {
    if (context.type === context.UserEventType.DELETE) return;

    const rec = context.newRecord;
    const sendEmail = rec.getValue({ fieldId: 'custrecordnotify' }); //
    const customerId = rec.getValue({ fieldId: 'custrecord_customer' }); // ✅ standard field holding customer reference

    if (!sendEmail || !customerId) {
        log.debug('Email not triggered', 'Checkbox not marked or no customer linked');
        return;
    }

    try {
        const customerRec = record.load({
            type: record.Type.CUSTOMER,
            id: customerId
        });

        const emailTo = customerRec.getValue({ fieldId: 'email' });

        if (!emailTo) {
            log.debug('No email found on customer', customerId);
            return;
        }

        const tranId = rec.getValue({ fieldId: 'id' });

        email.send({
            author: runtime.getCurrentUser().id,
            recipients: emailTo as string, //test case passes on addinf string
            subject: `Order Confirmation: ${tranId}`,
            body: `Dear customer, your Blanket Sales Order ${tranId} has been submitted successfully.`
        });

        log.audit('Email sent successfully', `To: ${emailTo}`);
    } catch (e: any) {
        log.error('Error sending email', e.message || e);
    }
};
/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as email from 'N/email';
import * as runtime from 'N/runtime';
import * as log from 'N/log';

export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (context) => {
    if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) return;

    const newRecord = context.newRecord;
    const customerName = newRecord.getValue('custrecord4') as string;
    const orderId = newRecord.id;
    const deliveryDate = newRecord.getValue('custrecord10');
    const orderStatus = newRecord.getValue('custrecordst_') as boolean;
    const shouldNotify = newRecord.getValue('custrecordnotify') as boolean;

    if (shouldNotify) {
        try {
            const e = newRecord.getValue('custrecorde_id') as string;

            if (e) {
                const subject = `Order #${orderId} - Status Update`;
                const body = `
                    Dear Customer,<br><br>
                    Your order <strong>#${orderId}</strong> has been updated.<br><br>
                    <strong>Status:</strong> ${orderStatus}<br>
                    <strong>Scheduled Delivery:</strong> ${deliveryDate || 'Not Scheduled'}<br><br>
                    If you have any questions, please reach out to our support team.<br><br>
                    Regards,<br>Your Company
                `;
                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: e,
                    subject: subject,
                    body: body
                });

                log.debug('Email Sent', `To: ${e}`);
            } else {
                log.error('Email Not Found', 'Customer email address is missing.');
            }
        } catch (error) {
            log.error('Email Send Failed', error.message);
        }
    } else {
        log.audit('Notification Skipped', 'Customer opted out of email notifications.');
    }
};

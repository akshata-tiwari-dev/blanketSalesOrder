/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

import * as log from 'N/log';
import * as serverWidget from 'N/ui/serverWidget';
import * as record from 'N/record';
import { EntryPoints } from 'N/types';

const STATUS_APPROVED = '1';
const STATUS_PENDING_APPROVAL = '2';
const STATUS_REJECTED = '3';
const FIELD_ID = 'custrecord125';

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (context) => {
    const form = context.form;
    const newRecord = context.newRecord;

    try {
        const statusValue = newRecord.getValue({ fieldId: FIELD_ID }) as string;
        const statusField = form.getField({ id: FIELD_ID }) as serverWidget.Field;

        if (statusField && (context.type === context.UserEventType.EDIT)) {
            if (statusValue === STATUS_APPROVED || statusValue === STATUS_REJECTED) {
                const options = statusField.getSelectOptions();
                options.forEach(option => {
                    if (option.value !== statusValue) {
                        statusField.removeSelectOption({ value: option.value });
                    }
                });

                statusField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
            }
        }

    } catch (e: any) {
        log.error({
            title: 'beforeLoad error',
            details: e.message
        });
    }
};

export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (context) => {
    const newRecord = context.newRecord;

    try {
        const newStatus = newRecord.getValue({ fieldId: FIELD_ID }) as string;

        // Load the existing record (to compare status change)
        if (context.type === context.UserEventType.EDIT) {
            const existingRecord = record.load({
                type: newRecord.type as string,
                id: newRecord.id as number,
                isDynamic: false
            });

            const currentStatus = existingRecord.getValue({ fieldId: FIELD_ID }) as string;

            const isLocked = (currentStatus === STATUS_APPROVED || currentStatus === STATUS_REJECTED);

            if (isLocked && newStatus !== currentStatus) {
                throw new Error('Status cannot be changed once it is Approved or Rejected.');
            }
        }

        if (context.type === context.UserEventType.CREATE) {
            newRecord.setValue({
                fieldId: FIELD_ID,
                value: STATUS_PENDING_APPROVAL
            });
        }

    } catch (e: any) {
        log.error({
            title: 'beforeSubmit error',
            details: e.message
        });
        throw e;
    }
};

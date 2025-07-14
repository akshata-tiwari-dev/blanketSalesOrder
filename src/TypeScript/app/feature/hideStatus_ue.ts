/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

/**
 * Author - Akshata Tiwari
 */

import { EntryPoints } from 'N/types';
import serverWidget = require('N/ui/serverWidget');

const APPROVAL_FIELD_ID = 'custrecord127';

/**
 * beforeLoad - Controls visibility of approval field and sets default value
 *
 * @param context.type       - Event type (create/edit/view/etc)
 * @param context.form       - The form being loaded
 * @param context.newRecord  - The current record instance
 */
export function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext): void {
    const { form, type, newRecord } = context;

    const approvalField = form.getField({ id: APPROVAL_FIELD_ID });
    if (!approvalField) return;

    // Display or hide approval field based on event type
    switch (type) {
        case context.UserEventType.CREATE:
            approvalField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            break;

        case context.UserEventType.EDIT:
        case context.UserEventType.VIEW:
            approvalField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.NORMAL
            });
            break;

        default:
            break;
    }

    // Default value for approval field is set to 2 (Pending Approval?)
    newRecord.setValue({
        fieldId: APPROVAL_FIELD_ID,
        value: 2
    });
}
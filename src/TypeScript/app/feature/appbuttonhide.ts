/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import serverWidget = require('N/ui/serverWidget');

const APPROVAL_FIELD_ID = 'custrecord127';

export function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext): void {
    const { form, type, newRecord } = context;

    const approvalField = form.getField({ id: APPROVAL_FIELD_ID });
    if (!approvalField) return;

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

    newRecord.setValue({
        fieldId: APPROVAL_FIELD_ID,
        value: 2
    });
}

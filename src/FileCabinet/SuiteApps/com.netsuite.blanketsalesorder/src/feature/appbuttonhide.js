/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["require", "exports", "N/ui/serverWidget"], function (require, exports, serverWidget) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    const APPROVAL_FIELD_ID = 'custrecord127';
    function beforeLoad(context) {
        const { form, type, newRecord } = context;
        const approvalField = form.getField({ id: APPROVAL_FIELD_ID });
        if (!approvalField)
            return;
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
    exports.beforeLoad = beforeLoad;
});

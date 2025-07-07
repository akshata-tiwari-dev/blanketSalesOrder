/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
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
define(["require", "exports", "N/log", "N/ui/serverWidget", "N/record"], function (require, exports, log, serverWidget, record) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = exports.beforeLoad = void 0;
    log = __importStar(log);
    serverWidget = __importStar(serverWidget);
    record = __importStar(record);
    const STATUS_APPROVED = '1';
    const STATUS_PENDING_APPROVAL = '2';
    const STATUS_REJECTED = '3';
    const FIELD_ID = 'custrecord125';
    const beforeLoad = (context) => {
        const form = context.form;
        const newRecord = context.newRecord;
        try {
            const statusValue = newRecord.getValue({ fieldId: FIELD_ID });
            const statusField = form.getField({ id: FIELD_ID });
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
        }
        catch (e) {
            log.error({
                title: 'beforeLoad error',
                details: e.message
            });
        }
    };
    exports.beforeLoad = beforeLoad;
    const beforeSubmit = (context) => {
        const newRecord = context.newRecord;
        try {
            const newStatus = newRecord.getValue({ fieldId: FIELD_ID });
            // Load the existing record (to compare status change)
            if (context.type === context.UserEventType.EDIT) {
                const existingRecord = record.load({
                    type: newRecord.type,
                    id: newRecord.id,
                    isDynamic: false
                });
                const currentStatus = existingRecord.getValue({ fieldId: FIELD_ID });
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
        }
        catch (e) {
            log.error({
                title: 'beforeSubmit error',
                details: e.message
            });
            throw e;
        }
    };
    exports.beforeSubmit = beforeSubmit;
});

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
define(["require", "exports", "N/email", "N/runtime", "N/record", "N/log"], function (require, exports, email, runtime, record, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = void 0;
    email = __importStar(email);
    runtime = __importStar(runtime);
    record = __importStar(record);
    log = __importStar(log);
    const afterSubmit = (context) => {
        if (context.type === context.UserEventType.DELETE)
            return;
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
                recipients: emailTo,
                subject: `Order Confirmation: ${tranId}`,
                body: `Dear customer, your Blanket Sales Order ${tranId} has been submitted successfully.`
            });
            log.audit('Email sent successfully', `To: ${emailTo}`);
        }
        catch (e) {
            log.error('Error sending email', e.message || e);
        }
    };
    exports.afterSubmit = afterSubmit;
});

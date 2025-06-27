/**
 * @NAPIVersion 2.1
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
define(["require", "exports", "N/email", "N/runtime", "N/log"], function (require, exports, email, runtime, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = void 0;
    email = __importStar(email);
    runtime = __importStar(runtime);
    log = __importStar(log);
    const afterSubmit = (context) => {
        if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT)
            return;
        const newRecord = context.newRecord;
        const customerName = newRecord.getValue('custrecord4');
        const orderId = newRecord.id;
        const deliveryDate = newRecord.getValue('custrecord10');
        const orderStatus = newRecord.getValue('custrecordst_');
        const shouldNotify = newRecord.getValue('custrecordnotify');
        if (shouldNotify) {
            try {
                const e = newRecord.getValue('custrecorde_id');
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
                }
                else {
                    log.error('Email Not Found', 'Customer email address is missing.');
                }
            }
            catch (error) {
                log.error('Email Send Failed', error.message);
            }
        }
        else {
            log.audit('Notification Skipped', 'Customer opted out of email notifications.');
        }
    };
    exports.afterSubmit = afterSubmit;
});

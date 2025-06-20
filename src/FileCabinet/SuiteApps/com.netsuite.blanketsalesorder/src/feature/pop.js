/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet

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
define(["require", "exports", "N/ui/serverWidget"], function (require, exports, serverWidget) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    serverWidget = __importStar(serverWidget);
    const onRequest = (context) => {
        const request = context.request;
        const response = context.response;
        const form = serverWidget.createForm({
            title: 'Schedule',
        });
        // Add buttons
        form.addButton({
            id: 'custpage_auto_generate',
            label: 'Auto Generate',
            functionName: 'autoGenerateSchedule'
        });
        form.clientScriptModulePath = './CS_AutoGenerateSchedule.js';
        // Sublist
        const sublist = form.addSublist({
            id: 'custpage_schedule_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Schedule'
        });
        sublist.addField({
            id: 'custpage_order',
            label: 'Order',
            type: serverWidget.FieldType.TEXT
        });
        sublist.addField({
            id: 'custpage_date',
            label: 'Date',
            type: serverWidget.FieldType.DATE
        });
        // Auto-populate values if flag present
        if (request.method === 'GET' && request.parameters.autogenerate === 'true') {
            const today = new Date();
            for (let i = 0; i < 5; i++) {
                const nextDate = new Date(today);
                nextDate.setMonth(today.getMonth() + i);
                sublist.setSublistValue({
                    id: 'custpage_order',
                    line: i,
                    value: `ORD-${i + 1}`
                });
                sublist.setSublistValue({
                    id: 'custpage_date',
                    line: i,
                    value: nextDate.toISOString().split('T')[0]
                });
            }
        }
        response.writePage(form);
    };
    exports.onRequest = onRequest;
});

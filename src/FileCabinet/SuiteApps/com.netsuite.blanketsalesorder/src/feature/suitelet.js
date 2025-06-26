/**
 * @NApiVersion 2.1
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/ui/serverWidget", "N/record", "N/log", "N/format"], function (require, exports, serverWidget_1, record, log, format) {
    "use strict";
    serverWidget_1 = __importDefault(serverWidget_1);
    record = __importStar(record);
    log = __importStar(log);
    format = __importStar(format);
    function onRequest(context) {
        const request = context.request;
        const response = context.response;
        if (request.method === 'GET') {
            const form = serverWidget_1.default.createForm({ title: 'Schedule Generator' });
            form.addField({
                id: 'custpage_start_date',
                label: 'Start Date',
                type: serverWidget_1.default.FieldType.DATE
            });
            form.addField({
                id: 'custpage_end_date',
                label: 'End Date',
                type: serverWidget_1.default.FieldType.DATE
            });
            form.addField({
                id: 'custpage_quantity',
                label: 'Quantity',
                type: serverWidget_1.default.FieldType.INTEGER
            });
            const sublist = form.addSublist({
                id: 'custpage_schedule_sublist',
                label: 'Generated Schedule',
                type: serverWidget_1.default.SublistType.INLINEEDITOR
            });
            /* sublist.addField({
                 id: 'custpage_item_id',
                 label: 'Item',
                 type: serverWidget.FieldType.SELECT,
                 source: '208'
             });*/
            sublist.addField({
                id: 'custpage_release_date',
                label: 'Release Date',
                type: serverWidget_1.default.FieldType.DATE
            });
            const objRecord = record.load({
                type: 'customrecord606',
                id: isDynamic, true: 
            });
            sublist.addField({
                id: 'custpage_release_qty',
                label: 'Quantity',
                type: serverWidget_1.default.FieldType.INTEGER
            });
            form.addSubmitButton({ label: 'Save Schedule' });
            form.addButton({
                id: 'custpage_auto_generate',
                label: 'Auto Generate',
                functionName: 'autoGenerateSchedule'
            });
            form.clientScriptModulePath = './clientscript.js';
            response.writePage(form);
        }
        if (request.method === 'POST') {
            const key = 'custpage_schedule_sublist';
            const sublistItem = {
                custpage_release_date: true,
                custpage_release_qty: true
            };
            const lineCount = request.getLineCount({ group: key });
            const actual = {};
            actual[key] = [];
            let successCount = 0;
            let failureCount = 0;
            for (let i = 0; i < lineCount; i++) {
                var id = request.getSublistValue({
                    group: 'ITEMS',
                    line: i,
                    name: ''
                });
                actual[key][i] = {};
                actual[key][i]['custpage_release_date'] = request.getSublistValue({
                    group: key,
                    name: 'custpage_release_date',
                    line: i
                });
                actual[key][i]['custpage_release_qty'] = request.getSublistValue({
                    group: key,
                    name: 'custpage_release_qty',
                    line: i
                });
                const releaseDate = actual[key][i]['custpage_release_date'];
                const releaseQty = actual[key][i]['custpage_release_qty'];
                if (!releaseDate || !releaseQty) {
                    failureCount++;
                    continue;
                }
                try {
                    const sched = record.create({
                        type: 'customrecord208',
                        isDynamic: true
                    });
                    sched.setValue({
                        fieldId: 'custrecordstdate',
                        value: format.parse({
                            value: releaseDate,
                            type: format.Type.DATE
                        })
                    });
                    sched.setValue({
                        fieldId: 'custrecordqtyy',
                        value: parseInt(releaseQty)
                    });
                    sched.setValue({
                        fieldId: 'name',
                        value: 'Generated Schedule - ' + (i + 1)
                    });
                    sched.save();
                    successCount++;
                }
                catch (e) {
                    failureCount++;
                    log.error({
                        title: `Error Saving Schedule - Line ${i}`,
                        details: e
                    });
                }
            }
            response.write(`Schedule creation completed.<br>Success: ${successCount}<br>Failed: ${failureCount}`);
        }
    }
    return { onRequest };
});

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
define(["require", "exports", "N/ui/serverWidget", "N/search", "N/task", "N/log", "N/format"], function (require, exports, ui, search, task, log, format) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    ui = __importStar(ui);
    search = __importStar(search);
    task = __importStar(task);
    log = __importStar(log);
    format = __importStar(format);
    function formatDate(date) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    }
    const onRequest = (context) => {
        const request = context.request;
        const response = context.response;
        if (request.parameters.action === 'runmr') {
            try {
                const mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript164',
                    deploymentId: 'customdeploy1'
                });
                const taskId = mrTask.submit();
                log.audit('MR Triggered via Suitelet', `Task ID: ${taskId}`);
                // response.setHeader({ name: 'Content-Type', value: 'application/json' });
                // response.write(JSON.stringify({ success: true, taskId }));
            }
            catch (e) {
                log.error('Error triggering MR', e.message);
                // response.setHeader({ name: 'Content-Type', value: 'application/json' });
                // response.write(JSON.stringify({ success: false, message: e.message }));
            }
            response.write('MR Triggered');
            return;
        }
        const form = ui.createForm({ title: 'Generate Sales Orders for Today' });
        form.clientScriptModulePath = './SO_list_client.js';
        form.addButton({
            id: 'custpage_generate_so',
            label: 'Generate Sales Orders',
            functionName: 'triggerMapReduce'
        });
        const sublist = form.addSublist({
            id: 'custpage_so_list',
            label: 'Today\'s Sales Orders',
            type: ui.SublistType.LIST
        });
        sublist.addField({ id: 'tranid', type: ui.FieldType.TEXT, label: 'SO Number' });
        sublist.addField({ id: 'entity', type: ui.FieldType.TEXT, label: 'Customer' });
        sublist.addField({ id: 'trandate', type: ui.FieldType.DATE, label: 'Date' });
        const today = new Date();
        const nsToday = format.format({
            value: today,
            type: format.Type.DATE
        });
        const nsTodayWithTime = format.format({
            value: today,
            type: format.Type.DATETIME
        });
        log.debug('NetSuite Today (formatted)', nsTodayWithTime);
        try {
            const soSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    // ['trandate', 'on', formattedToday],
                    // 'AND',
                    ['trandate', 'onorafter', nsToday],
                    'AND',
                    ['trandate', 'onorbefore', nsToday],
                    'AND',
                    ['mainline', 'is', 'T'],
                    // Optional: add [
                    // 'custbodyiscreated', 'is', 'T'] if field is verified
                    'AND',
                    ['custbodyiscreated', 'is', 'T']
                ],
                columns: ['tranid', 'entity', 'trandate']
            });
            const results = soSearch.run().getRange({ start: 0, end: 50 }) || [];
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                sublist.setSublistValue({ id: 'tranid', line: i, value: String(result.getValue('tranid') || '') });
                sublist.setSublistValue({ id: 'entity', line: i, value: result.getText('entity') || '' });
                sublist.setSublistValue({ id: 'trandate', line: i, value: String(result.getValue('trandate') || '') });
            }
        }
        catch (e) {
            log.error({ title: 'Sublist Search Error', details: e.message });
        }
        response.writePage(form);
    };
    exports.onRequest = onRequest;
});

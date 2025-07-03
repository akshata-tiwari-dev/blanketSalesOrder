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
define(["require", "exports", "N/ui/serverWidget", "N/log", "N/cache"], function (require, exports, serverWidget_1, log, cache) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    serverWidget_1 = __importDefault(serverWidget_1);
    log = __importStar(log);
    cache = __importStar(cache);
    // 🧩 Helper to parse delimited sublist data
    function parseScheduleList(sublistData) {
        const rows = sublistData.split('\x02');
        const schedule = [];
        for (let i = 0; i < rows.length - 1; i += 2) {
            const dateStr = rows[i]?.trim();
            const qtyStr = rows[i + 1]?.trim();
            if (!dateStr || !qtyStr)
                continue;
            const date = new Date(dateStr);
            const qty = parseInt(qtyStr, 10);
            if (!isFinite(date.getTime()) || isNaN(qty))
                continue;
            schedule.push({ date: date.toISOString(), qty });
        }
        return schedule;
    }
    function onRequest(context) {
        const request = context.request;
        const response = context.response;
        // 🟢 GET — render form
        if (request.method === 'GET') {
            const itemId = request.parameters.itemid || '';
            if (!itemId) {
                response.write('Missing itemid parameter');
                return;
            }
            const timestamp = Date.now();
            const scheduleCode = `${itemId}-${timestamp}`;
            const form = serverWidget_1.default.createForm({ title: 'Schedule Generator' });
            form.clientScriptModulePath = './clientscript.js';
            form.addField({ id: 'custpage_start_date', label: 'Start Date', type: serverWidget_1.default.FieldType.DATE });
            form.addField({ id: 'custpage_end_date', label: 'End Date', type: serverWidget_1.default.FieldType.DATE });
            form.addField({ id: 'custpage_quantity', label: 'Quantity', type: serverWidget_1.default.FieldType.INTEGER });
            const freqField = form.addField({
                id: 'custpage_release_freq',
                label: 'Release Frequency',
                type: serverWidget_1.default.FieldType.SELECT
            });
            freqField.addSelectOption({ value: '', text: 'Select Frequency' });
            freqField.addSelectOption({ value: 'e', text: 'Daily' });
            freqField.addSelectOption({ value: 'b', text: 'Weekly' });
            freqField.addSelectOption({ value: 'c', text: 'Bi-Weekly' });
            freqField.addSelectOption({ value: 'a', text: 'Monthly' });
            freqField.addSelectOption({ value: 'd', text: 'Quarterly' });
            freqField.addSelectOption({ value: 'y', text: 'Yearly' });
            const sublist = form.addSublist({
                id: 'custpage_schedule_sublist',
                label: 'Generated Schedule',
                type: serverWidget_1.default.SublistType.INLINEEDITOR
            });
            sublist.addField({ id: 'custpage_release_date', label: 'Release Date', type: serverWidget_1.default.FieldType.DATE });
            sublist.addField({ id: 'custpage_release_qty', label: 'Quantity', type: serverWidget_1.default.FieldType.INTEGER });
            const itemField = form.addField({ id: 'custpage_item_id', label: 'Item ID', type: serverWidget_1.default.FieldType.TEXT });
            itemField.defaultValue = itemId;
            itemField.updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN });
            const schedCodeField = form.addField({ id: 'custpage_schedule_code', label: 'Schedule Code', type: serverWidget_1.default.FieldType.TEXT });
            schedCodeField.defaultValue = scheduleCode;
            schedCodeField.updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN });
            form.addButton({ id: 'custpage_auto_generate', label: 'Auto Generate', functionName: 'autoGenerateSchedule' });
            form.addButton({ id: 'custpage_save_schedule', label: 'Save Schedule', functionName: 'saveScheduleToCache' });
            form.addSubmitButton({ label: 'Done' });
            response.writePage(form);
        }
        // 🔴 POST — save to cache
        if (request.method === 'POST') {
            response.setHeader({ name: 'Content-Type', value: 'application/json' });
            try {
                if (!request.body || typeof request.body !== 'string') {
                    log.error('Missing POST body', 'No data received.');
                    response.write(JSON.stringify({
                        success: false,
                        message: 'No data received.'
                    }));
                    return;
                }
                let scheduleCode;
                let scheduleData;
                let itemId;
                const body = request.body.trim();
                if (body.startsWith('{')) {
                    const parsed = JSON.parse(body);
                    scheduleCode = parsed.scheduleCode;
                    scheduleData = parsed.scheduleData;
                    itemId = parsed.itemId || scheduleCode?.split('-')[0];
                }
                else if (body.includes('custpage_schedule_code=') && body.includes('custpage_schedule_sublistdata=')) {
                    const params = {};
                    body.split('&').forEach(p => {
                        const [k, v] = p.split('=');
                        if (k && v)
                            params[decodeURIComponent(k)] = decodeURIComponent(v);
                    });
                    scheduleCode = params['custpage_schedule_code'];
                    const rawData = params['custpage_schedule_sublistdata'];
                    scheduleData = rawData ? parseScheduleList(rawData) : [];
                    itemId = scheduleCode?.split('-')[0];
                }
                else {
                    throw new Error('Unsupported POST format.');
                }
                log.debug('ScheduleData received', scheduleData.length);
                if (!scheduleCode || !Array.isArray(scheduleData) || !itemId) {
                    throw new Error('Missing or invalid scheduleCode or itemId');
                }
                const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
                scheduleCache.put({ key: scheduleCode, value: JSON.stringify(scheduleData), ttl: 3600 });
                const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC });
                reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: scheduleCode, ttl: 300 });
                log.debug('Reverse cache entry stored', `Key: last-schedule-for-item-${itemId}, Value: ${scheduleCode}`);
                log.audit('Schedule cached', `Item ID: ${itemId}, Schedule Code: ${scheduleCode}, Entries: ${scheduleData.length}`);
                response.write(JSON.stringify({
                    success: true,
                    message: `Schedule saved under code: ${scheduleCode}`
                }));
            }
            catch (e) {
                log.error('POST handler error', e.message || e);
                response.write(JSON.stringify({
                    success: false,
                    message: e.message || 'Unexpected error'
                }));
            }
        }
    }
    exports.onRequest = onRequest;
});

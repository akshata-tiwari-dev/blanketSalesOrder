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
define(["require", "exports", "N/ui/serverWidget", "N/record", "N/log", "N/cache", "N/format", "N/search"], function (require, exports, serverWidget_1, record, log, cache, format, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    serverWidget_1 = __importDefault(serverWidget_1);
    record = __importStar(record);
    log = __importStar(log);
    cache = __importStar(cache);
    format = __importStar(format);
    search = __importStar(search);
    function onRequest(context) {
        const request = context.request;
        const response = context.response;
        if (request.method === 'GET') {
            const itemId = request.parameters.itemid || '';
            const bsoId = request.parameters.bsoId || '';
            if (!itemId) {
                response.write('Missing itemid parameter');
                return;
            }
            const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC });
            const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
            let cachedScheduleData = [];
            let cachedStartDate = '';
            let cachedEndDate = '';
            let cachedQuantity = '';
            let cachedReleaseFreq = '';
            let scheduleCode = '';
            if (bsoId) {
                const sublistItemLineSearch = search.create({
                    type: 'customrecord_item',
                    filters: [
                        ['custrecord_itemid', 'anyof', itemId],
                        'AND',
                        ['custrecord_bso_item_sublist_link', 'anyof', bsoId]
                    ],
                    columns: ['custrecord_stdate', 'custrecord_enddate', 'custrecord_quantity', 'custrecord_freq']
                });
                const sublistItemLineResult = sublistItemLineSearch.run().getRange({ start: 0, end: 1 })[0];
                if (sublistItemLineResult) {
                    cachedStartDate = sublistItemLineResult.getValue('custrecord_stdate');
                    cachedEndDate = sublistItemLineResult.getValue('custrecord_enddate');
                    cachedQuantity = sublistItemLineResult.getValue('custrecord_quantity');
                    cachedReleaseFreq = sublistItemLineResult.getValue('custrecord_freq');
                }
                const scheduleDataSearch = search.create({
                    type: 'customrecord_schedule',
                    filters: [
                        ['custrecord_schsublink.custrecord_itemid', 'anyof', itemId],
                        'AND',
                        ['custrecord_schsublink.custrecord_bso_item_sublist_link', 'anyof', bsoId]
                    ],
                    columns: ['custrecordstdate', 'custrecordqtyy']
                });
                const scheduleDataResults = scheduleDataSearch.run().getRange({ start: 0, end: 100 }) || [];
                for (const row of scheduleDataResults) {
                    cachedScheduleData.push({
                        date: row.getValue('custrecordstdate'),
                        qty: parseInt(row.getValue('custrecordqtyy'))
                    });
                }
            }
            else {
                const latestScheduleCode = reverseCache.get({
                    key: `last-schedule-for-item-${itemId}`,
                    loader: () => ''
                });
                if (latestScheduleCode) {
                    const cachedData = scheduleCache.get({ key: latestScheduleCode, loader: () => '' });
                    if (cachedData) {
                        try {
                            const parsed = JSON.parse(cachedData);
                            cachedScheduleData = parsed.scheduleData || [];
                            cachedStartDate = parsed.startDate || '';
                            cachedEndDate = parsed.endDate || '';
                            cachedQuantity = parsed.quantity || '';
                            cachedReleaseFreq = parsed.releaseFreq || '';
                            scheduleCode = latestScheduleCode;
                        }
                        catch (e) {
                            log.error('Failed to parse cached data', e);
                        }
                    }
                }
                else {
                    scheduleCode = `${itemId}-${Date.now()}`;
                    const payload = JSON.stringify({
                        scheduleData: [],
                        startDate: '',
                        endDate: '',
                        quantity: '',
                        releaseFreq: ''
                    });
                    scheduleCache.put({ key: scheduleCode, value: payload, ttl: 3600 });
                    reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: scheduleCode, ttl: 300 });
                    log.audit('Initialized empty schedule cache', scheduleCode);
                }
            }
            const form = serverWidget_1.default.createForm({ title: 'Schedule Generator' });
            form.clientScriptModulePath = './clientscript.js';
            form.addField({
                id: 'custpage_start_date',
                label: 'Start Date',
                type: serverWidget_1.default.FieldType.DATE
            }).defaultValue = cachedStartDate ? new Date(cachedStartDate) : null;
            form.addField({
                id: 'custpage_end_date',
                label: 'End Date',
                type: serverWidget_1.default.FieldType.DATE
            }).defaultValue = cachedEndDate ? new Date(cachedEndDate) : null;
            form.addField({
                id: 'custpage_quantity',
                label: 'Quantity',
                type: serverWidget_1.default.FieldType.INTEGER
            }).defaultValue = cachedQuantity;
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
            if (cachedReleaseFreq)
                freqField.defaultValue = cachedReleaseFreq;
            const sublist = form.addSublist({
                id: 'custpage_schedule_sublist',
                label: 'Generated Schedule',
                type: serverWidget_1.default.SublistType.INLINEEDITOR
            });
            sublist.addField({
                id: 'custpage_release_date',
                label: 'Release Date',
                type: serverWidget_1.default.FieldType.DATE
            });
            sublist.addField({
                id: 'custpage_release_qty',
                label: 'Quantity',
                type: serverWidget_1.default.FieldType.INTEGER
            });
            let line = 0;
            for (const entry of cachedScheduleData) {
                sublist.setSublistValue({
                    id: 'custpage_release_date',
                    line,
                    value: format.format({ value: new Date(entry.date), type: format.Type.DATE })
                });
                sublist.setSublistValue({
                    id: 'custpage_release_qty',
                    line,
                    value: entry.qty
                });
                line++;
            }
            const itemField = form.addField({
                id: 'custpage_item_id',
                label: 'Item ID',
                type: serverWidget_1.default.FieldType.TEXT
            });
            itemField.defaultValue = itemId;
            itemField.updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN });
            const bsoField = form.addField({
                id: 'custpage_bso_id',
                label: 'BSO ID',
                type: serverWidget_1.default.FieldType.TEXT
            });
            bsoField.defaultValue = bsoId;
            bsoField.updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN });
            const schedCodeField = form.addField({
                id: 'custpage_schedule_code',
                label: 'Schedule Code',
                type: serverWidget_1.default.FieldType.TEXT
            });
            schedCodeField.defaultValue = scheduleCode;
            schedCodeField.updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN });
            form.addButton({ id: 'custpage_auto_generate', label: 'Auto Generate', functionName: 'autoGenerateSchedule' });
            form.addButton({
                id: 'custpage_save_schedule',
                label: 'Save Schedule',
                functionName: 'saveScheduleToCache'
            });
            //form.addSubmitButton({label: 'Done'});
            response.writePage(form);
        }
        if (request.method === 'POST') {
            response.setHeader({ name: 'Content-Type', value: 'application/json' });
            try {
                const body = request.body?.trim();
                log.debug('Raw request body (POST)', body);
                if (!body) {
                    log.error('Empty POST body');
                    response.write(JSON.stringify({ success: false, message: 'No data received.' }));
                    return;
                }
                let parsed;
                try {
                    parsed = JSON.parse(body);
                }
                catch (e) {
                    log.error('Invalid JSON in POST', e.message || e);
                    response.write(JSON.stringify({ success: false, message: 'Invalid JSON: ' + e.message }));
                    return;
                }
                const { scheduleCode, scheduleData, itemId, bsoId, startDate = '', endDate = '', quantity = '', releaseFreq = '' } = parsed;
                log.debug('Parsed POST data', { scheduleCode, itemId, bsoId, startDate, endDate, quantity, releaseFreq });
                if (!itemId || !Array.isArray(scheduleData)) {
                    throw new Error('Missing or invalid itemId or scheduleData');
                }
                if (bsoId) {
                    log.debug('Mode: Save to database', { bsoId, itemId });
                    const itemSearch = search.create({
                        type: 'customrecord_item',
                        filters: [
                            ['custrecord_itemid', 'anyof', itemId],
                            'AND',
                            ['custrecord_bso_item_sublist_link', 'anyof', bsoId]
                        ],
                        columns: ['internalid']
                    });
                    const itemLine = itemSearch.run().getRange({ start: 0, end: 1 })[0];
                    if (!itemLine)
                        throw new Error('Item Line not found for BSO');
                    const lineId = itemLine.getValue({ name: 'internalid' });
                    const itemRec = record.load({
                        type: 'customrecord_item',
                        id: lineId,
                        isDynamic: true
                    });
                    if (startDate) {
                        itemRec.setValue({
                            fieldId: 'custrecord_stdate',
                            value: format.parse({
                                value: startDate,
                                type: format.Type.DATE
                            })
                        });
                    }
                    if (endDate) {
                        itemRec.setValue({
                            fieldId: 'custrecord_enddate',
                            value: format.parse({
                                value: endDate,
                                type: format.Type.DATE
                            })
                        });
                    }
                    if (quantity)
                        itemRec.setValue({ fieldId: 'custrecord_quantity', value: Number(quantity) });
                    if (releaseFreq)
                        itemRec.setValue({ fieldId: 'custrecord_freq', value: releaseFreq });
                    itemRec.setValue({ fieldId: 'custrecord_gensch', value: false });
                    itemRec.save();
                    log.audit('Item line record updated', { lineId });
                    // Delete existing schedules
                    const schedSearch = search.create({
                        type: 'customrecord_schedule',
                        filters: [['custrecord_schsublink', 'anyof', lineId]],
                        columns: ['internalid']
                    });
                    schedSearch.run().each(result => {
                        const sid = result.getValue({ name: 'internalid' });
                        try {
                            record.delete({ type: 'customrecord_schedule', id: sid });
                            log.debug('Deleted old schedule', sid);
                        }
                        catch (e) {
                            log.error('Failed to delete schedule', { id: sid, error: e.message });
                        }
                        return true;
                    });
                    var i = 1;
                    // Create new schedules
                    for (const entry of scheduleData) {
                        try {
                            const sched = record.create({
                                type: 'customrecord_schedule',
                                isDynamic: true
                            });
                            sched.setValue({ fieldId: 'name', value: `Schedule No-${i}-Item ID-${itemId}` });
                            i++;
                            sched.setValue({ fieldId: 'custrecord_schsublink', value: lineId });
                            if (entry.date) {
                                sched.setValue({
                                    fieldId: 'custrecordstdate',
                                    value: format.parse({
                                        value: entry.date,
                                        type: format.Type.DATE
                                    })
                                });
                            }
                            sched.setValue({ fieldId: 'custrecordqtyy', value: entry.qty });
                            const newId = sched.save();
                            log.debug('Created new schedule', { id: newId, date: entry.date, qty: entry.qty });
                        }
                        catch (e) {
                            log.error('Error creating schedule', e.message || e);
                        }
                    }
                    log.audit('DB save complete', { bsoId, scheduleCount: scheduleData.length });
                    response.write(JSON.stringify({ success: true, message: 'Schedule saved to database.' }));
                }
                else {
                    log.debug('Mode: Save to cache (creation flow)', { itemId });
                    const payload = {
                        scheduleData,
                        startDate,
                        endDate,
                        quantity,
                        releaseFreq
                    };
                    const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
                    scheduleCache.put({ key: scheduleCode, value: JSON.stringify(payload), ttl: 3600 });
                    const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC });
                    reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: scheduleCode, ttl: 300 });
                    log.audit('Schedule cached', { itemId, scheduleCode });
                    response.write(JSON.stringify({ success: true, message: `Schedule cached under code: ${scheduleCode}` }));
                }
            }
            catch (e) {
                log.error('Unhandled POST error', e.message || e);
                response.write(JSON.stringify({ success: false, message: e.message || 'Unexpected error occurred' }));
            }
        }
    }
    exports.onRequest = onRequest;
});

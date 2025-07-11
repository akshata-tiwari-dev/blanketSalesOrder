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
define(["require", "exports", "N/ui/serverWidget", "N/record", "N/log", "N/cache", "N/format", "N/search", "N/url", "N/runtime"], function (require, exports, serverWidget_1, record, log, cache, format, search, url, runtime) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    serverWidget_1 = __importDefault(serverWidget_1);
    record = __importStar(record);
    log = __importStar(log);
    cache = __importStar(cache);
    format = __importStar(format);
    search = __importStar(search);
    url = __importStar(url);
    runtime = __importStar(runtime);
    function onRequest(context) {
        const { request, response } = context;
        if (request.method === 'GET') {
            const itemId = request.parameters.itemid || '';
            const bsoId = request.parameters.bsoId || '';
            const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC });
            const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
            let isReadOnly = false;
            let cachedScheduleData = [], cachedStartDate = '', cachedEndDate = '', cachedQuantity = '', cachedReleaseFreq = '', scheduleCode = '';
            // Load from DB (edit)
            if (bsoId) {
                const bsoStatus = record.load({
                    type: 'customrecord_bso',
                    id: bsoId,
                    isDynamic: false
                }).getValue({ fieldId: 'custrecord127' });
                if (bsoStatus == 1 || bsoStatus == 3) {
                    isReadOnly = true;
                }
                const sublistItemLineSearch = search.create({
                    type: 'customrecord_item',
                    filters: [['custrecord_itemid', 'anyof', itemId], 'AND', ['custrecord_bso_item_sublist_link', 'anyof', bsoId]],
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
                    columns: ['custrecordstdate', 'custrecordqtyy', 'custrecord_so_link']
                });
                const results = scheduleDataSearch.run().getRange({ start: 0, end: 100 }) || [];
                for (const row of results) {
                    cachedScheduleData.push({
                        date: row.getValue('custrecordstdate'),
                        qty: parseInt(row.getValue('custrecordqtyy')),
                        salesOrderId: row.getValue('custrecord_so_link')
                    });
                }
            }
            else {
                // Load from cache (new BSO)
                const latestScheduleCode = reverseCache.get({
                    key: `last-schedule-for-item-${itemId}`,
                    loader: () => ''
                });
                if (latestScheduleCode) {
                    const cachedData = scheduleCache.get({ key: latestScheduleCode, loader: () => '' });
                    if (cachedData) {
                        const parsed = JSON.parse(cachedData);
                        cachedScheduleData = parsed.scheduleData || [];
                        cachedStartDate = parsed.startDate || '';
                        cachedEndDate = parsed.endDate || '';
                        cachedQuantity = parsed.quantity || '';
                        cachedReleaseFreq = parsed.releaseFreq || '';
                        scheduleCode = latestScheduleCode;
                    }
                }
            }
            const form = serverWidget_1.default.createForm({ title: 'Schedule Generator' });
            form.clientScriptModulePath = './clientscript.js';
            // Form Fields
            form.addField({
                id: 'custpage_start_date',
                label: 'Start Date',
                type: serverWidget_1.default.FieldType.DATE
            }).updateDisplayType({
                displayType: isReadOnly ? serverWidget_1.default.FieldDisplayType.DISABLED : serverWidget_1.default.FieldDisplayType.NORMAL
            }).defaultValue = cachedStartDate ? new Date(cachedStartDate) : null;
            form.addField({
                id: 'custpage_end_date',
                label: 'End Date',
                type: serverWidget_1.default.FieldType.DATE
            }).updateDisplayType({
                displayType: isReadOnly ? serverWidget_1.default.FieldDisplayType.DISABLED : serverWidget_1.default.FieldDisplayType.NORMAL
            }).defaultValue = cachedEndDate ? new Date(cachedEndDate) : null;
            form.addField({
                id: 'custpage_quantity',
                label: 'Quantity',
                type: serverWidget_1.default.FieldType.INTEGER
            }).updateDisplayType({
                displayType: isReadOnly ? serverWidget_1.default.FieldDisplayType.DISABLED : serverWidget_1.default.FieldDisplayType.NORMAL
            }).defaultValue = cachedQuantity;
            const freqField = form.addField({
                id: 'custpage_release_freq',
                label: 'Release Frequency',
                type: serverWidget_1.default.FieldType.SELECT
            }).updateDisplayType({
                displayType: isReadOnly ? serverWidget_1.default.FieldDisplayType.DISABLED : serverWidget_1.default.FieldDisplayType.NORMAL
            });
            ['e:Daily', 'b:Weekly', 'c:Bi-Weekly', 'a:Monthly', 'd:Quarterly', 'y:Yearly'].forEach(opt => {
                const [value, text] = opt.split(':');
                freqField.addSelectOption({ value, text });
            });
            freqField.defaultValue = cachedReleaseFreq || '';
            // Sublist for schedule data
            const sublist = form.addSublist({
                id: 'custpage_schedule_sublist',
                label: 'Generated Schedule',
                type: serverWidget_1.default.SublistType.INLINEEDITOR
            });
            sublist.addField({ id: 'custpage_release_date', label: 'Release Date', type: serverWidget_1.default.FieldType.DATE }).updateDisplayType({
                displayType: isReadOnly ? serverWidget_1.default.FieldDisplayType.DISABLED : serverWidget_1.default.FieldDisplayType.NORMAL
            });
            sublist.addField({ id: 'custpage_release_qty', label: 'Quantity', type: serverWidget_1.default.FieldType.INTEGER }).updateDisplayType({
                displayType: isReadOnly ? serverWidget_1.default.FieldDisplayType.DISABLED : serverWidget_1.default.FieldDisplayType.NORMAL
            });
            sublist.addField({ id: 'custpage_sales_order_link', label: 'Sales Order Link', type: serverWidget_1.default.FieldType.URL }).updateDisplayType({
                displayType: serverWidget_1.default.FieldDisplayType.HIDDEN
            });
            sublist.addField({
                id: 'custpage_sales_order_link_display',
                label: 'Sales Order Status',
                type: serverWidget_1.default.FieldType.TEXT
            });
            sublist.addField({
                id: 'custpage_so_open_checkbox',
                label: 'Open SO',
                type: serverWidget_1.default.FieldType.CHECKBOX
            });
            // Populate sublist
            let line = 0;
            for (const entry of cachedScheduleData) {
                sublist.setSublistValue({
                    id: 'custpage_release_date',
                    line,
                    value: format.format({ value: new Date(entry.date), type: format.Type.DATE })
                });
                sublist.setSublistValue({ id: 'custpage_release_qty', line, value: entry.qty });
                if (entry.salesOrderId) {
                    const resolvedUrl = url.resolveRecord({
                        recordType: 'salesorder',
                        recordId: entry.salesOrderId,
                        isEditMode: false
                    });
                    const accountDomain = `https://${runtime.accountId.toLowerCase()}.app.netsuite.com`;
                    const fullUrl = accountDomain + resolvedUrl;
                    sublist.setSublistValue({
                        id: 'custpage_sales_order_link',
                        line,
                        value: fullUrl
                    });
                    sublist.setSublistValue({
                        id: 'custpage_sales_order_link_display',
                        line,
                        value: 'Sales Order Created'
                    });
                }
                else {
                    sublist.setSublistValue({
                        id: 'custpage_sales_order_link_display',
                        line,
                        value: 'Sales Order not created'
                    });
                }
                line++;
            }
            form.addField({
                id: 'custpage_item_id',
                label: 'Item ID',
                type: serverWidget_1.default.FieldType.TEXT
            }).updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN }).defaultValue = itemId;
            form.addField({
                id: 'custpage_bso_id',
                label: 'BSO ID',
                type: serverWidget_1.default.FieldType.TEXT
            }).updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN }).defaultValue = bsoId;
            form.addField({
                id: 'custpage_schedule_code',
                label: 'Schedule Code',
                type: serverWidget_1.default.FieldType.TEXT
            }).updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN }).defaultValue = scheduleCode;
            if (!isReadOnly) {
                form.addButton({
                    id: 'custpage_auto_generate',
                    label: 'Auto Generate',
                    functionName: 'autoGenerateSchedule'
                });
                form.addButton({
                    id: 'custpage_save_schedule',
                    label: 'Save Schedule',
                    functionName: 'saveScheduleToCache'
                });
            }
            response.writePage(form);
        }
        if (request.method === 'POST') {
            response.setHeader({ name: 'Content-Type', value: 'application/json' });
            try {
                const body = request.body?.trim();
                log.debug('Raw request body (POST)', body);
                if (!body)
                    throw new Error('No data received.');
                const { scheduleCode, scheduleData, itemId, bsoId, startDate = '', endDate = '', quantity = '', releaseFreq = '' } = JSON.parse(body);
                if (!itemId || !Array.isArray(scheduleData)) {
                    throw new Error('Missing or invalid itemId or scheduleData');
                }
                if (bsoId) {
                    const itemLineResult = search.create({
                        type: 'customrecord_item',
                        filters: [
                            ['custrecord_itemid', 'anyof', itemId],
                            'AND',
                            ['custrecord_bso_item_sublist_link', 'anyof', bsoId]
                        ],
                        columns: ['internalid']
                    }).run().getRange({ start: 0, end: 1 })[0];
                    if (!itemLineResult)
                        throw new Error('Item Line not found. Save BSO first.');
                    const lineId = itemLineResult.getValue({ name: 'internalid' });
                    const itemRec = record.load({ type: 'customrecord_item', id: lineId, isDynamic: true });
                    if (startDate)
                        itemRec.setValue({
                            fieldId: 'custrecord_stdate',
                            value: format.parse({ value: startDate, type: format.Type.DATE })
                        });
                    if (endDate)
                        itemRec.setValue({
                            fieldId: 'custrecord_enddate',
                            value: format.parse({ value: endDate, type: format.Type.DATE })
                        });
                    if (quantity)
                        itemRec.setValue({ fieldId: 'custrecord_quantity', value: Number(quantity) });
                    if (releaseFreq)
                        itemRec.setValue({ fieldId: 'custrecord_freq', value: releaseFreq });
                    itemRec.setValue({ fieldId: 'custrecord_gensch', value: false });
                    itemRec.save();
                    // Delete existing schedules
                    search.create({
                        type: 'customrecord_schedule',
                        filters: [['custrecord_schsublink', 'anyof', lineId]],
                        columns: ['internalid']
                    }).run().each(result => {
                        record.delete({
                            type: 'customrecord_schedule',
                            id: result.getValue({ name: 'internalid' })
                        });
                        return true;
                    });
                    // Create new schedules
                    let i = 1;
                    for (const entry of scheduleData) {
                        const sched = record.create({ type: 'customrecord_schedule', isDynamic: true });
                        sched.setValue({ fieldId: 'name', value: `Schedule No-${i}-Item ID-${itemId}` });
                        sched.setValue({ fieldId: 'custrecord_schsublink', value: lineId });
                        sched.setValue({ fieldId: 'custrecordqtyy', value: entry.qty });
                        if (entry.salesOrderId) {
                            sched.setValue({ fieldId: 'custrecord_so_link', value: entry.salesOrderId });
                        }
                        if (entry.date) {
                            sched.setValue({
                                fieldId: 'custrecordstdate',
                                value: format.parse({ value: entry.date, type: format.Type.DATE })
                            });
                        }
                        sched.save();
                        i++;
                    }
                    log.audit('Schedule DB save complete', { bsoId, itemId });
                    response.write(JSON.stringify({ success: true, message: 'Schedule saved to database.' }));
                }
                else {
                    // Generate a fallback scheduleCode if missing
                    const finalCode = scheduleCode || `${itemId}-${Date.now()}`;
                    const payload = { scheduleData, startDate, endDate, quantity, releaseFreq };
                    const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
                    scheduleCache.put({ key: finalCode, value: JSON.stringify(payload), ttl: 3600 });
                    const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC });
                    reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: finalCode, ttl: 300 });
                    log.audit('Schedule cached', { itemId, scheduleCode: finalCode });
                    response.write(JSON.stringify({ success: true, message: `Schedule cached under code: ${finalCode}` }));
                }
            }
            catch (e) {
                log.error('Unhandled POST error', e.message || e);
                response.write(JSON.stringify({ success: false, message: e.message || 'Unexpected error' }));
            }
        }
    }
    exports.onRequest = onRequest;
});

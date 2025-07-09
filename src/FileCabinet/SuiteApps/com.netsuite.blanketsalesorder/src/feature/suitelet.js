/**
 * @NAPIVersion 2.1
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
define(["require", "exports", "N/ui/serverWidget", "N/log", "N/cache", "N/format", "N", "N/search"], function (require, exports, serverWidget_1, log, cache, format, N_1, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    serverWidget_1 = __importDefault(serverWidget_1);
    log = __importStar(log);
    cache = __importStar(cache);
    format = __importStar(format);
    search = __importStar(search);
    // Helper Function used to parse delimited sublist data stored in the payload during cache interaction(Optional -- can be used to extract scheduleData in array form)
    function parseScheduleList(sublistData) {
        const rows = sublistData.split('\x02');
        const scheduleDataInArray = [];
        for (let i = 0; i < rows.length - 1; i += 2) {
            const dateStr = rows[i]?.trim();
            const qtyStr = rows[i + 1]?.trim();
            if (!dateStr || !qtyStr)
                continue;
            const date = new Date(dateStr);
            const qty = parseInt(qtyStr, 10);
            if (!isFinite(date.getTime()) || isNaN(qty))
                continue;
            scheduleDataInArray.push({ date: date.toISOString(), qty });
        }
        return scheduleDataInArray;
    }
    function onRequest(context) {
        const request = context.request;
        const response = context.response;
        const rec = N_1.currentRecord.get();
        if (request.method === 'GET') {
            //getting itemlineid as itemId and bsorecordid as bsoId as parameters from the popup url
            const itemId = request.parameters.itemid || '';
            const bsoId = request.parameters.bsoId || '';
            if (!itemId) {
                response.write('Missing itemid parameter');
                return;
            }
            //cache interaction
            const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC }); //to get scheduleCode from itemId
            const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC }); //to get scheduleData(Payload) from scheduleCode
            let cachedScheduleData = [];
            let cachedStartDate = '';
            let cachedEndDate = '';
            let cachedQuantity = '';
            let cachedReleaseFreq = '';
            let scheduleCode = '';
            let rawData = null;
            //if bsoId is present (opening popup on an Item after submit) data is loaded from own record DB
            if (bsoId) {
                log.debug('bso id is:', bsoId);
                //performed saved search to get scheduled data from it's own DB
                const sublistItemLineSearch = search.create({
                    type: 'customrecord_item',
                    filters: [
                        ['custrecord_itemid', 'anyof', itemId],
                        'AND',
                        ['custrecord_bso_item_sublist_link', 'anyof', bsoId]
                    ],
                    columns: ['custrecord_stdate', 'custrecord_enddate', 'custrecord_quantity', 'custrecord_freq']
                });
                //Fetched data from a particular item line
                const sublistItemLineResult = sublistItemLineSearch.run().getRange({ start: 0, end: 1 })[0];
                if (sublistItemLineResult) {
                    cachedStartDate = sublistItemLineResult.getValue('custrecord_stdate');
                    cachedEndDate = sublistItemLineResult.getValue('custrecord_enddate');
                    cachedQuantity = sublistItemLineResult.getValue('custrecord_quantity');
                    cachedReleaseFreq = sublistItemLineResult.getValue('custrecord_freq');
                }
                //Saved search to extract schedule linked to that itemLine
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
                scheduleCode = `${itemId}-${Date.now()}`;
                //creating a payload to cluster all data
                const payload = JSON.stringify({
                    scheduleData: cachedScheduleData,
                    startDate: cachedStartDate,
                    endDate: cachedEndDate,
                    quantity: cachedQuantity,
                    releaseFreq: cachedReleaseFreq
                });
                //adding data into cache but it's optional as form next we fetch data from the DB not Web Cache
                scheduleCache.put({ key: scheduleCode, value: payload, ttl: 3600 });
                reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: scheduleCode, ttl: 300 });
                rawData = payload;
            }
            else {
                // If bsoid is not present means we are opening popup during the BSO creation here the internalId of bso record is not exposed
                //If user opens the popup again the previous saved data will be fetched
                const latestScheduleCode = reverseCache.get({ key: `last-schedule-for-item-${itemId}`, loader: () => '' });
                //if user is opening a saved or already exiting  popup at that itemLine
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
                //if user is opening a fresh or new popup at that itemLine
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
                    //linking the scheduleCode with the itemId in the cache
                    reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: scheduleCode, ttl: 300 });
                    log.audit('Initialized empty schedule cache', scheduleCode);
                }
            }
            //Creation of Suitelet Form
            const form = serverWidget_1.default.createForm({ title: 'Schedule Generator' });
            //Linking suitelet with Clientscript which includes function(Auto
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
                try {
                    // Convert to JS Date and add 1 day (86,400,000 ms)
                    const rawDate = new Date(entry.date);
                    if (isNaN(rawDate.getTime())) {
                        log.error('Invalid date in entry:', entry.date);
                        continue;
                    }
                    rawDate.setTime(rawDate.getTime() + 24 * 60 * 60 * 1000); // ✅ Add 1 day safely
                    const formattedDate = format.format({
                        value: rawDate,
                        type: format.Type.DATE
                    });
                    sublist.setSublistValue({
                        id: 'custpage_release_date',
                        line,
                        value: formattedDate
                    });
                    sublist.setSublistValue({
                        id: 'custpage_release_qty',
                        line,
                        value: entry.qty
                    });
                    line++;
                }
                catch (e) {
                    log.error('Sublist render error', e.message || e);
                }
            }
            scheduleCode = `${itemId}-${Date.now()}`;
            const itemField = form.addField({
                id: 'custpage_item_id',
                label: 'Item ID',
                type: serverWidget_1.default.FieldType.TEXT
            });
            itemField.defaultValue = itemId;
            itemField.updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN });
            const schedCodeField = form.addField({
                id: 'custpage_schedule_code',
                label: 'Schedule Code',
                type: serverWidget_1.default.FieldType.TEXT
            });
            schedCodeField.defaultValue = scheduleCode;
            schedCodeField.updateDisplayType({ displayType: serverWidget_1.default.FieldDisplayType.HIDDEN });
            form.addButton({ id: 'custpage_auto_generate', label: 'Auto Generate', functionName: 'autoGenerateSchedule' });
            form.addSubmitButton({ label: 'Done' });
            response.writePage(form);
        }
        // 🔴 POST — save to cache
        if (request.method === 'POST') {
            response.setHeader({ name: 'Content-Type', value: 'application/json' });
            try {
                if (!request.body || typeof request.body !== 'string') {
                    log.error('Missing POST body', 'No data received.');
                    response.write(JSON.stringify({ success: false, message: 'No data received.' }));
                    return;
                }
                let scheduleCode;
                let scheduleData;
                let itemId;
                let startDate = '';
                let endDate = '';
                let quantity = '';
                let releaseFreq = '';
                const body = request.body.trim();
                if (body.startsWith('{')) {
                    const parsed = JSON.parse(body);
                    scheduleCode = parsed.scheduleCode;
                    scheduleData = parsed.scheduleData;
                    itemId = parsed.itemId || scheduleCode?.split('-')[0];
                    startDate = parsed.startDate || '';
                    endDate = parsed.endDate || '';
                    quantity = parsed.quantity || '';
                    releaseFreq = parsed.releaseFreq || '';
                }
                else {
                    throw new Error('Unsupported POST format.');
                }
                if (!scheduleCode || !Array.isArray(scheduleData) || !itemId) {
                    throw new Error('Missing or invalid scheduleCode or itemId');
                }
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
                log.audit('Schedule cached', `Item ID: ${itemId}, Schedule Code: ${scheduleCode}, Entries: ${scheduleData.length}`);
                response.write(JSON.stringify({ success: true, message: `Schedule saved under code: ${scheduleCode}` }));
            }
            catch (e) {
                log.error('POST handler error', e.message || e);
                response.write(JSON.stringify({ success: false, message: e.message || 'Unexpected error' }));
            }
        }
    }
    exports.onRequest = onRequest;
});

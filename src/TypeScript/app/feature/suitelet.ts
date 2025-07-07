/**
 * @NAPIVersion 2.1
 * @NScriptType Suitelet
 */

import serverWidget from 'N/ui/serverWidget';
import * as record from 'N/record';
import * as log from 'N/log';
import * as cache from 'N/cache';
import * as format from 'N/format';
import { EntryPoints } from 'N/types';
import {currentRecord} from 'N';
import * as search from 'N/search';

// 🧩 Helper to parse delimited sublist data
function parseScheduleList(sublistData: string): Array<{ date: string, qty: number }> {
    const rows = sublistData.split('\x02');
    const schedule: Array<{ date: string, qty: number }> = [];

    for (let i = 0; i < rows.length - 1; i += 2) {
        const dateStr = rows[i]?.trim();
        const qtyStr = rows[i + 1]?.trim();
        if (!dateStr || !qtyStr) continue;

        const date = new Date(dateStr);
        const qty = parseInt(qtyStr, 10);
        if (!isFinite(date.getTime()) || isNaN(qty)) continue;

        schedule.push({ date: date.toISOString(), qty });
    }

    return schedule;
}

export function onRequest(context: EntryPoints.Suitelet.onRequestContext) {
    const request = context.request;
    const response = context.response;
    const rec=currentRecord.get();
    if (request.method === 'GET') {
        const itemId = request.parameters.itemid || '';
        const bsoId = request.parameters.bsoId || '';
        if (!itemId) {
            response.write('Missing itemid parameter');
            return;
        }
        const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC });
        const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
        let cachedScheduleData: Array<{ date: string, qty: number }> = [];
        let cachedStartDate = '';
        let cachedEndDate = '';
        let cachedQuantity = '';
        let cachedReleaseFreq = '';
        let scheduleCode = '';
        let rawData: string | null = null;
        if (bsoId) {
            // :large_green_circle: DB FETCH FROM BSO
            log.debug('bso id is:', bsoId);
            const sublistSearch = search.create({
                type: 'customrecord_item',
                filters: [
                    ['custrecord_itemid', 'anyof', itemId],
                    'AND',
                    ['custrecord_bso_item_sublist_link', 'anyof', bsoId]
                ],
                columns: ['custrecord_stdate', 'custrecord_enddate', 'custrecord_quantity', 'custrecord_freq']
            });
            const sublistResult = sublistSearch.run().getRange({ start: 0, end: 1 })[0];
            if (sublistResult) {
                cachedStartDate = sublistResult.getValue('custrecord_stdate') as string;
                cachedEndDate = sublistResult.getValue('custrecord_enddate') as string;
                cachedQuantity = sublistResult.getValue('custrecord_quantity') as string;
                cachedReleaseFreq = sublistResult.getValue('custrecord_freq') as string;
            }
            const scheduleSearch = search.create({
                type: 'customrecord_schedule',
                filters: [
                    ['custrecord_schsublink.custrecord_itemid', 'anyof', itemId],
                    'AND',
                    ['custrecord_schsublink.custrecord_bso_item_sublist_link', 'anyof', bsoId]
                ],
                columns: ['custrecordstdate', 'custrecordqtyy']
            });
            const scheduleResults = scheduleSearch.run().getRange({ start: 0, end: 100 }) || [];
            for (const row of scheduleResults) {
                cachedScheduleData.push({
                    date: row.getValue('custrecordstdate') as string,
                    qty: parseInt(row.getValue('custrecordqtyy') as string)
                });
            }
            scheduleCode = `${itemId}-${Date.now()}`;
            const payload = JSON.stringify({
                scheduleData: cachedScheduleData,
                startDate: cachedStartDate,
                endDate: cachedEndDate,
                quantity: cachedQuantity,
                releaseFreq: cachedReleaseFreq
            });
            scheduleCache.put({ key: scheduleCode, value: payload, ttl: 3600 });
            reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: scheduleCode, ttl: 300 });
            rawData = payload;
        } else {
            // :repeat: Try cache fallback
            const latestScheduleCode = reverseCache.get({ key: `last-schedule-for-item-${itemId}`, loader: () => '' }) as string;
            if (latestScheduleCode) {
                const cachedData = scheduleCache.get({ key: latestScheduleCode, loader: () => '' }) as string;
                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        cachedScheduleData = parsed.scheduleData || [];
                        cachedStartDate = parsed.startDate || '';
                        cachedEndDate = parsed.endDate || '';
                        cachedQuantity = parsed.quantity || '';
                        cachedReleaseFreq = parsed.releaseFreq || '';
                        scheduleCode = latestScheduleCode;
                    } catch (e) {
                        log.error('Failed to parse cached data', e);
                    }
                }
            } else {
                // :no_entry: No BSO, no cache — create empty payload
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
        // :white_check_mark: Now build and return the form
        const form = serverWidget.createForm({ title: 'Schedule Generator' });
        form.clientScriptModulePath = './clientscript.js';
        form.addField({
            id: 'custpage_start_date',
            label: 'Start Date',
            type: serverWidget.FieldType.DATE
        }).defaultValue = cachedStartDate ? new Date(cachedStartDate) : null;
        form.addField({
            id: 'custpage_end_date',
            label: 'End Date',
            type: serverWidget.FieldType.DATE
        }).defaultValue = cachedEndDate ? new Date(cachedEndDate) : null;
        form.addField({
            id: 'custpage_quantity',
            label: 'Quantity',
            type: serverWidget.FieldType.INTEGER
        }).defaultValue = cachedQuantity;
        const freqField = form.addField({
            id: 'custpage_release_freq',
            label: 'Release Frequency',
            type: serverWidget.FieldType.SELECT
        });
        freqField.addSelectOption({ value: '', text: 'Select Frequency' });
        freqField.addSelectOption({ value: 'e', text: 'Daily' });
        freqField.addSelectOption({ value: 'b', text: 'Weekly' });
        freqField.addSelectOption({ value: 'c', text: 'Bi-Weekly' });
        freqField.addSelectOption({ value: 'a', text: 'Monthly' });
        freqField.addSelectOption({ value: 'd', text: 'Quarterly' });
        freqField.addSelectOption({ value: 'y', text: 'Yearly' });
        if (cachedReleaseFreq) freqField.defaultValue = cachedReleaseFreq;
        const sublist = form.addSublist({
            id: 'custpage_schedule_sublist',
            label: 'Generated Schedule',
            type: serverWidget.SublistType.INLINEEDITOR
        });
        sublist.addField({
            id: 'custpage_release_date',
            label: 'Release Date',
            type: serverWidget.FieldType.DATE
        });
        sublist.addField({
            id: 'custpage_release_qty',
            label: 'Quantity',
            type: serverWidget.FieldType.INTEGER
        });
        let line = 0;
        for (const entry of cachedScheduleData) {
            try {
                const formattedDate = format.format({
                    value: new Date(entry.date),
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
            } catch (e: any) {
                log.error('Sublist render error', e.message || e);
            }
        }
        scheduleCode = `${itemId}-${Date.now()}`;
        const itemField = form.addField({
            id: 'custpage_item_id',
            label: 'Item ID',
            type: serverWidget.FieldType.TEXT
        });
        itemField.defaultValue = itemId;
        itemField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

        const schedCodeField = form.addField({
            id: 'custpage_schedule_code',
            label: 'Schedule Code',
            type: serverWidget.FieldType.TEXT
        });
        schedCodeField.defaultValue = scheduleCode;
        schedCodeField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
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

            let scheduleCode: string;
            let scheduleData: any[];
            let itemId: string;
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
            } else {
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

        } catch (e: any) {
            log.error('POST handler error', e.message || e);
            response.write(JSON.stringify({ success: false, message: e.message || 'Unexpected error' }));
        }
    }
}
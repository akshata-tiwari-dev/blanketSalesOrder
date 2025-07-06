/**
 * @NAPIVersion 2.1
 * @NScriptType Suitelet
 */

import serverWidget from 'N/ui/serverWidget';
import * as record from 'N/record';
import * as log from 'N/log';
import * as cache from 'N/cache';
import { EntryPoints } from 'N/types';

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

    if (request.method === 'GET') {
        const itemId = request.parameters.itemid || '';
        if (!itemId) {
            response.write('Missing itemid parameter');
            return;
        }

        const reverseCache = cache.getCache({ name: 'item_schedule_latest', scope: cache.Scope.PUBLIC });
        const latestScheduleCode = reverseCache.get({ key: `last-schedule-for-item-${itemId}`, loader: () => '' }) as string;

        let cachedScheduleData: Array<{ date: string, qty: number }> = [];
        let cachedStartDate = '';
        let cachedEndDate = '';
        let cachedQuantity = '';
        let cachedReleaseFreq = '';

        if (latestScheduleCode) {
            const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
            const dataStr = scheduleCache.get({ key: latestScheduleCode, loader: () => '' }) as string;

            if (dataStr) {
                try {
                    const parsed = JSON.parse(dataStr);
                    if (Array.isArray(parsed.scheduleData)) {
                        cachedScheduleData = parsed.scheduleData;
                        cachedStartDate = parsed.startDate || '';
                        cachedEndDate = parsed.endDate || '';
                        cachedQuantity = parsed.quantity || '';
                        cachedReleaseFreq = parsed.releaseFreq || '';
                    }
                } catch (e) {
                    log.error('Failed to parse cached schedule', e);
                }
            }
        } else {
            const timestamp = Date.now();
            const newScheduleCode = `${itemId}-${timestamp}`;

            const scheduleCache = cache.getCache({ name: 'item_schedule_cache', scope: cache.Scope.PUBLIC });
            const defaultPayload = {
                scheduleData: [],
                startDate: '',
                endDate: '',
                quantity: '',
                releaseFreq: ''
            };

            scheduleCache.put({ key: newScheduleCode, value: JSON.stringify(defaultPayload), ttl: 3600 });
            reverseCache.put({ key: `last-schedule-for-item-${itemId}`, value: newScheduleCode, ttl: 300 });

            log.audit('Initialized empty schedule cache', newScheduleCode);
        }

        const timestamp = Date.now();
        const scheduleCode = `${itemId}-${timestamp}`;
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
        if (cachedScheduleData.length > 0) {
            cachedScheduleData.forEach((entry, index) => {
                if (index >= 1000) return;
                if (entry.date) {
                    sublist.setSublistValue({
                        id: 'custpage_schedule_date',
                        line: index,
                        value: entry.date.split('T')[0]
                    });
                }
                if (entry.qty !== undefined) {
                    sublist.setSublistValue({
                        id: 'custpage_schedule_qty',
                        line: index,
                        value: entry.qty.toString()
                    });
                }
            });
        }

        const preloadScript = `
            <script>
                window.scheduleMeta = ${JSON.stringify({
            startDate: cachedStartDate,
            endDate: cachedEndDate,
            quantity: cachedQuantity,
            releaseFreq: cachedReleaseFreq
        })};
                window.scheduleLines = ${JSON.stringify(cachedScheduleData)};
            </script>
        `;

        const preloadField = form.addField({
            id: 'custpage_preload_data',
            label: 'Preload Script',
            type: serverWidget.FieldType.INLINEHTML
        });
        preloadField.defaultValue = preloadScript;


        const itemField = form.addField({ id: 'custpage_item_id', label: 'Item ID', type: serverWidget.FieldType.TEXT });
        itemField.defaultValue = itemId;
        itemField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

        const schedCodeField = form.addField({ id: 'custpage_schedule_code', label: 'Schedule Code', type: serverWidget.FieldType.TEXT });
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
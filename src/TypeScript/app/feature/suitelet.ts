/**
 * @NApiVersion 2.1
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

    // 🟢 GET — render form
    if (request.method === 'GET') {
        const itemId = request.parameters.itemid || '';
        if (!itemId) {
            response.write('Missing itemid parameter');
            return;
        }

        const timestamp = Date.now();
        const scheduleCode = `${itemId}-${timestamp}`;

        const form = serverWidget.createForm({ title: 'Schedule Generator' });
        form.clientScriptModulePath = './clientscript.js';

        form.addField({ id: 'custpage_start_date', label: 'Start Date', type: serverWidget.FieldType.DATE });
        form.addField({ id: 'custpage_end_date', label: 'End Date', type: serverWidget.FieldType.DATE });
        form.addField({ id: 'custpage_quantity', label: 'Quantity', type: serverWidget.FieldType.INTEGER });

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

        const sublist = form.addSublist({
            id: 'custpage_schedule_sublist',
            label: 'Generated Schedule',
            type: serverWidget.SublistType.INLINEEDITOR
        });

        sublist.addField({ id: 'custpage_release_date', label: 'Release Date', type: serverWidget.FieldType.DATE });
        sublist.addField({ id: 'custpage_release_qty', label: 'Quantity', type: serverWidget.FieldType.INTEGER });

        const itemField = form.addField({ id: 'custpage_item_id', label: 'Item ID', type: serverWidget.FieldType.TEXT });
        itemField.defaultValue = itemId;
        itemField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

        const schedCodeField = form.addField({ id: 'custpage_schedule_code', label: 'Schedule Code', type: serverWidget.FieldType.TEXT });
        schedCodeField.defaultValue = scheduleCode;
        schedCodeField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

        form.addButton({ id: 'custpage_auto_generate', label: 'Auto Generate', functionName: 'autoGenerateSchedule' });
        //form.addButton({ id: 'custpage_save_schedule', label: 'Save Schedule', functionName: 'saveScheduleToCache' });

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

            let scheduleCode: string;
            let scheduleData: any[];
            let itemId: string;
            const body = request.body.trim();

            if (body.startsWith('{')) {
                const parsed = JSON.parse(body);
                scheduleCode = parsed.scheduleCode;
                scheduleData = parsed.scheduleData;
                itemId = parsed.itemId || scheduleCode?.split('-')[0];
            } else if (body.includes('custpage_schedule_code=') && body.includes('custpage_schedule_sublistdata=')) {
                const params: Record<string, string> = {};
                body.split('&').forEach(p => {
                    const [k, v] = p.split('=');
                    if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
                });

                scheduleCode = params['custpage_schedule_code'];
                const rawData = params['custpage_schedule_sublistdata'];
                scheduleData = rawData ? parseScheduleList(rawData) : [];
                itemId = scheduleCode?.split('-')[0];
            } else {
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

        } catch (e: any) {
            log.error('POST handler error', e.message || e);
            response.write(JSON.stringify({
                success: false,
                message: e.message || 'Unexpected error'
            }));
        }
    }
}
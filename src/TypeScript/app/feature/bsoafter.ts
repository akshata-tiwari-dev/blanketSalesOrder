/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as cache from 'N/cache';
import * as log from 'N/log';
import * as search from 'N/search';
import * as format from 'N/format';
export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (context) => {
    if (context.type === context.UserEventType.DELETE) return;

    const rec = context.newRecord;
    const bsoId = rec.id;

    const reverseCache = cache.getCache({
        name: 'item_schedule_latest',
        scope: cache.Scope.PUBLIC
    });

    const schedCache = cache.getCache({
        name: 'item_schedule_cache',
        scope: cache.Scope.PUBLIC
    });

    // 🔍 Search for all item line records linked to this BSO
    const lineSearch = search.create({
        type: 'customrecord_item', // 🔁 Your actual item line record type
        filters: [['custrecord_bso_item_sublist_link', 'anyof', bsoId]], // 🔁 field linking to BSO
        columns: ['internalid', 'custrecord_itemid'] // 🔁 23 = item reference
    });

    lineSearch.run().each(result => {
        const lineId = result.getValue({ name: 'internalid' }) as string;
        const itemId = result.getValue({ name: 'custrecord_itemid' }) as string;

        if (!lineId || !itemId) {
            log.debug('Skipping invalid line', { lineId, itemId });
            return true;
        }

        const scheduleCode = reverseCache.get({
            key: `last-schedule-for-item-${itemId}`,
            loader: () => null
        });

        if (!scheduleCode) {
            log.debug('No schedule code in cache', `Item ${itemId}`);
            return true;
        }

        const rawData = schedCache.get({
            key: scheduleCode,
            loader: () => null
        });

        if (!rawData) {
            log.debug('No schedule data for code', scheduleCode);
            return true;
        }

        let entries;
        try {
            entries = JSON.parse(rawData);
        } catch (e: any) {
            log.error('Failed to parse schedule data', e.message || e);
            return true;
        }

        if (!Array.isArray(entries) || entries.length === 0) {
            log.debug('Empty entries array', `Item: ${itemId}`);
            return true;
        }
var i=0;
        for (const entry of entries) {

            try {
                const sched = record.create({
                    type: 'customrecord_schedule',
                    isDynamic: true
                });

                var jsDate = new Date(entry.date);

                // Parse it into a NetSuite DATE type (or DATETIME if your field requires it)
                var releaseDate = format.parse({
                    value: jsDate,
                    type: format.Type.DATE // or format.Type.DATETIME if needed
                });
                sched.setValue({ fieldId: 'name', value: `Schedule No-${i}-Item ID-${itemId}` });
                sched.setValue({ fieldId: 'custrecord_schsublink', value: lineId });
                sched.setValue({ fieldId: 'custrecordstdate', value: releaseDate });
                sched.setValue({ fieldId: 'custrecordqtyy', value: entry.qty });

                const schedId = sched.save();
                log.debug('Created schedule', `ID: ${schedId}, Item: ${itemId}, Qty: ${entry.qty}`);
            } catch (e: any) {
                log.error('Schedule creation failed', e.message || e);
            }
            i++;
        }

        return true;
    });
};
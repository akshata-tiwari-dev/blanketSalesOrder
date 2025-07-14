/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Author - Ashutosh Mohanty
 */
import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as cache from 'N/cache';
import * as log from 'N/log';
import * as search from 'N/search';
import * as format from 'N/format';

/**
 * After Submit Trigger
 * Handles item schedule sync with cache and updates related custom records.
 *
 * @param context - User event context
 */
export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (context) => {
    if (context.type === context.UserEventType.DELETE) return;

    const rec   = context.newRecord;
    const bsoId = rec.id;

    const reverseCache = cache.getCache({
        name:  'item_schedule_latest',
        scope: cache.Scope.PUBLIC
    });

    const schedCache = cache.getCache({
        name:  'item_schedule_cache',
        scope: cache.Scope.PUBLIC
    });

    const lineSearch = search.create({
        type:    'customrecord_item',
        filters: [['custrecord_bso_item_sublist_link', 'anyof', bsoId]],
        columns: ['internalid', 'custrecord_itemid']
    });

    lineSearch.run().each(result => {
        const lineId = result.getValue({ name: 'internalid' }) as string;
        const itemId = result.getValue({ name: 'custrecord_itemid' }) as string;

        if (!lineId || !itemId) {
            log.debug('Skipping invalid line', { lineId, itemId });
            return true;
        }

        const scheduleCode = reverseCache.get({
            key:    `last-schedule-for-item-${itemId}`,
            loader: () => ''
        });

        let isCacheLoaded = false;
        let rawData       = null;

        if (scheduleCode) {
            rawData = schedCache.get({
                key:    scheduleCode,
                loader: () => ''
            });

            if (rawData) {
                isCacheLoaded = true;
            } else {
                log.debug('No schedule data for code', scheduleCode);
                return true;
            }
        } else {
            log.debug('No schedule code in cache', `Item ${itemId}`);
            try {
                const itemLine = record.load({
                    type:       'customrecord_item',
                    id:         lineId,
                    isDynamic:  true
                });

                itemLine.setValue({
                    fieldId: 'custrecord_gensch',
                    value:   false
                });

                itemLine.save();
                log.debug('Unchecked gensch despite no cache', { itemId, lineId });
            } catch (e: any) {
                log.error('Failed to uncheck gensch when no cache', e.message || e);
            }
            return true;
        }

        let parsed;
        try {
            parsed = JSON.parse(rawData);
        } catch (e: any) {
            log.error('Failed to parse schedule data', e.message || e);
            return true;
        }

        const {
            scheduleData = [],
            startDate,
            endDate,
            quantity,
            releaseFreq
        } = parsed;

        // Update item line with metadata from cache
        try {
            const itemLine = record.load({
                type:      'customrecord_item',
                id:        lineId,
                isDynamic: true
            });

            itemLine.setValue({
                fieldId: 'custrecord_gensch',
                value:   false
            });

            if (startDate) {
                const start = new Date(startDate);
                if (isCacheLoaded) {
                    start.setTime(start.getTime() + 0);
                }
                itemLine.setValue({
                    fieldId: 'custrecord_stdate',
                    value:   format.parse({
                        value: start,
                        type:  format.Type.DATE
                    })
                });
            }

            if (endDate) {
                const end = new Date(endDate);
                if (isCacheLoaded) {
                    end.setTime(end.getTime() + 0);
                }
                itemLine.setValue({
                    fieldId: 'custrecord_enddate',
                    value:   format.parse({
                        value: end,
                        type:  format.Type.DATE
                    })
                });
            }

            if (quantity) {
                itemLine.setValue({
                    fieldId: 'custrecord_quantity',
                    value:   Number(quantity)
                });
            }

            if (releaseFreq) {
                itemLine.setValue({
                    fieldId: 'custrecord_freq',
                    value:   releaseFreq
                });
            }

            itemLine.save();
            log.debug('Updated item line metadata', { lineId, itemId });

        } catch (e: any) {
            log.error('Failed to update item line metadata', e.message || e);
        }

        // Delete old schedules linked to item line
        try {
            const existingSchedules = search.create({
                type:    'customrecord_schedule',
                filters: [['custrecord_schsublink', 'anyof', lineId]],
                columns: ['internalid']
            });

            existingSchedules.run().each(result => {
                const schedId = result.getValue({ name: 'internalid' }) as string;
                try {
                    record.delete({
                        type: 'customrecord_schedule',
                        id:   schedId
                    });
                    log.debug('Deleted existing schedule', `ID: ${schedId} for Item Line: ${lineId}`);
                } catch (e: any) {
                    log.error('Failed to delete existing schedule', `ID: ${schedId}, Error: ${e.message}`);
                }
                return true;
            });
        } catch (e: any) {
            log.error('Error during schedule cleanup', e.message);
        }

        // Create new schedules from cache
        let i = 1;
        for (const entry of scheduleData) {
            try {
                const sched = record.create({
                    type:      'customrecord_schedule',
                    isDynamic: true
                });

                const jsDate = new Date(entry.date);
                if (isCacheLoaded) {
                    jsDate.setTime(jsDate.getTime() + 0);
                }

                const releaseDate = format.parse({
                    value: jsDate,
                    type:  format.Type.DATE
                });

                sched.setValue({ fieldId: 'name',                 value: `Schedule No-${i}-Item ID-${itemId}` });
                sched.setValue({ fieldId: 'custrecord_schsublink', value: lineId });
                sched.setValue({ fieldId: 'custrecordstdate',      value: releaseDate });
                sched.setValue({ fieldId: 'custrecordqtyy',        value: entry.qty });

                const schedId = sched.save();
                log.debug('Created schedule', `ID: ${schedId}, Item: ${itemId}, Qty: ${entry.qty}`);
            } catch (e: any) {
                log.error('Schedule creation failed', e.message || e);
            }
            i++;
        }

        // Clean cache after processing
        try {
            reverseCache.remove({ key: `last-schedule-for-item-${itemId}` });

            if (scheduleCode) {
                schedCache.remove({ key: scheduleCode });
            }

            log.debug('Cleaned cache', { itemId, scheduleCode });
        } catch (e: any) {
            log.error('Failed to clean cache', e.message || e);
        }

        return true;
    });
};


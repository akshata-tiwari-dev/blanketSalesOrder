/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
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
define(["require", "exports", "N/record", "N/cache", "N/log", "N/search", "N/format"], function (require, exports, record, cache, log, search, format) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = void 0;
    record = __importStar(record);
    cache = __importStar(cache);
    log = __importStar(log);
    search = __importStar(search);
    format = __importStar(format);
    const afterSubmit = (context) => {
        if (context.type === context.UserEventType.DELETE)
            return;
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
        // :mag: Search for all item line records linked to this BSO
        const lineSearch = search.create({
            type: 'customrecord_item',
            filters: [['custrecord_bso_item_sublist_link', 'anyof', bsoId]],
            columns: ['internalid', 'custrecord_itemid']
        });
        lineSearch.run().each(result => {
            const lineId = result.getValue({ name: 'internalid' });
            const itemId = result.getValue({ name: 'custrecord_itemid' });
            if (!lineId || !itemId) {
                log.debug('Skipping invalid line', { lineId, itemId });
                return true;
            }
            const scheduleCode = reverseCache.get({
                key: `last-schedule-for-item-${itemId}`,
                loader: () => ''
            });
            if (!scheduleCode) {
                log.debug('No schedule code in cache', `Item ${itemId}`);
                return true;
            }
            const rawData = schedCache.get({
                key: scheduleCode,
                loader: () => ''
            });
            if (!rawData) {
                log.debug('No schedule data for code', scheduleCode);
                return true;
            }
            let parsed;
            try {
                parsed = JSON.parse(rawData);
            }
            catch (e) {
                log.error('Failed to parse schedule data', e.message || e);
                return true;
            }
            const entries = parsed.scheduleData || [];
            if (!Array.isArray(entries) || entries.length === 0) {
                log.debug('Empty entries array', `Item: ${itemId}`);
                return true;
            }
            let i = 0;
            for (const entry of entries) {
                try {
                    const sched = record.create({
                        type: 'customrecord_schedule',
                        isDynamic: true
                    });
                    const jsDate = new Date(entry.date);
                    const releaseDate = format.parse({
                        value: jsDate,
                        type: format.Type.DATE
                    });
                    sched.setValue({ fieldId: 'name', value: `Schedule No-${i}-Item ID-${itemId}` });
                    sched.setValue({ fieldId: 'custrecord_schsublink', value: lineId });
                    sched.setValue({ fieldId: 'custrecordstdate', value: releaseDate });
                    sched.setValue({ fieldId: 'custrecordqtyy', value: entry.qty });
                    const schedId = sched.save();
                    log.debug('Created schedule', `ID: ${schedId}, Item: ${itemId}, Qty: ${entry.qty}`);
                }
                catch (e) {
                    log.error('Schedule creation failed', e.message || e);
                }
                i++;
            }
            return true;
        });
    };
    exports.afterSubmit = afterSubmit;
});

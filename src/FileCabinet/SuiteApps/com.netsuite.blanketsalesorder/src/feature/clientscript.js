/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
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
define(["require", "exports", "N/currentRecord"], function (require, exports, currentRecord) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.saveScheduleToCache = exports.autoGenerateSchedule = exports.pageInit = void 0;
    currentRecord = __importStar(currentRecord);
    function pageInit(context) { }
    exports.pageInit = pageInit;
    function autoGenerateSchedule() {
        const rec = currentRecord.get();
        const sd = rec.getValue({ fieldId: 'custpage_start_date' });
        const ed = rec.getValue({ fieldId: 'custpage_end_date' });
        const qty = parseInt(rec.getValue({ fieldId: 'custpage_quantity' }), 10);
        const freq = rec.getValue({ fieldId: 'custpage_release_freq' });
        if (!sd || !ed || isNaN(qty) || !freq) {
            alert('Please fill all required fields.');
            return;
        }
        const freqDays = { e: 1, b: 7, c: 15, a: 30, d: 90, y: 365 };
        const interval = freqDays[freq] || 1;
        const msPerDay = 86400000;
        let start = new Date(sd);
        const end = new Date(ed);
        const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);
        if (totalDays <= 0) {
            alert('End Date must be after Start Date.');
            return;
        }
        const chunks = Math.floor(totalDays / interval);
        if (chunks === 0) {
            alert('Date range too short for selected frequency.');
            return;
        }
        const baseQty = Math.floor(qty / chunks);
        const remainder = qty % chunks;
        for (let i = 0; i < chunks; i++) {
            start = new Date(start.getTime() + interval * msPerDay);
            rec.selectNewLine({ sublistId: 'custpage_schedule_sublist' });
            rec.setCurrentSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_date',
                value: start
            });
            rec.setCurrentSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_qty',
                value: i === 0 ? baseQty + remainder : baseQty
            });
            rec.commitLine({ sublistId: 'custpage_schedule_sublist' });
        }
    }
    exports.autoGenerateSchedule = autoGenerateSchedule;
    function saveScheduleToCache() {
        try {
            if (event)
                event.preventDefault();
            const rec = currentRecord.get();
            const scheduleCode = rec.getValue({ fieldId: 'custpage_schedule_code' });
            const itemId = rec.getValue({ fieldId: 'custpage_item_id' });
            const lines = rec.getLineCount({ sublistId: 'custpage_schedule_sublist' });
            const scheduleData = [];
            for (let i = 0; i < lines; i++) {
                const date = rec.getSublistValue({
                    sublistId: 'custpage_schedule_sublist',
                    fieldId: 'custpage_release_date',
                    line: i
                });
                const qty = parseInt(rec.getSublistValue({
                    sublistId: 'custpage_schedule_sublist',
                    fieldId: 'custpage_release_qty',
                    line: i
                }), 10);
                if (date && qty)
                    scheduleData.push({ date, qty });
            }
            if (!scheduleCode || !itemId || scheduleData.length === 0) {
                alert('Missing required data.');
                return;
            }
            // ✅ POST to RESTlet or Suitelet to cache on server
            const scriptUrl = '/app/site/hosting/scriptlet.nl?script=152&deploy=1';
            fetch(scriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, scheduleCode, scheduleData })
            })
                .then(response => response.json())
                .then(result => {
                if (result.success) {
                    alert('Schedule cached successfully.');
                    window.close();
                }
                else {
                    alert('Server error: ' + (result.message || 'Unknown error'));
                }
            })
                .catch(e => alert('Fetch error: ' + e.message));
        }
        catch (e) {
            alert('Client error: ' + e.message);
        }
    }
    exports.saveScheduleToCache = saveScheduleToCache;
});

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/currentRecord", "N/ui/dialog"], function (require, exports, currentRecord, dialog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.saveRecord = exports.saveScheduleToCache = exports.autoGenerateSchedule = exports.pageInit = void 0;
    currentRecord = __importStar(currentRecord);
    dialog_1 = __importDefault(dialog_1);
    window.isGenerated = false;
    function pageInit(context) {
        try {
            const rec = currentRecord.get();
            // Preload meta fields
            if (window.scheduleMeta) {
                const meta = window.scheduleMeta;
                if (meta.startDate)
                    rec.setValue({ fieldId: 'custpage_start_date', value: meta.startDate });
                if (meta.endDate)
                    rec.setValue({ fieldId: 'custpage_end_date', value: meta.endDate });
                if (meta.quantity)
                    rec.setValue({ fieldId: 'custpage_quantity', value: parseInt(meta.quantity, 10) });
                if (meta.releaseFreq)
                    rec.setValue({ fieldId: 'custpage_release_freq', value: meta.releaseFreq });
            }
            // Preload sublist entries
            const sublistId = 'custpage_schedule_sublist';
            if (Array.isArray(window.scheduleLines) && window.scheduleLines.length > 0) {
                window.scheduleLines.forEach((entry) => {
                    if (!entry?.date || !entry?.qty)
                        return;
                    rec.selectNewLine({ sublistId });
                    rec.setCurrentSublistValue({ sublistId, fieldId: 'custpage_release_date', value: entry.date });
                    rec.setCurrentSublistValue({ sublistId, fieldId: 'custpage_release_qty', value: entry.qty });
                    rec.commitLine({ sublistId });
                });
                // ✅ Mark as already generated
                window.isGenerated = true;
            }
            else {
                window.isGenerated = false;
            }
        }
        catch (e) {
            console.error('Preload failed:', e.message || e);
        }
    }
    exports.pageInit = pageInit;
    function autoGenerateSchedule() {
        if (window.isGenerated) {
            alert('Schedule has already been auto-generated.');
            return;
        }
        const rec = currentRecord.get();
        const sd = rec.getValue({ fieldId: 'custpage_start_date' });
        const ed = rec.getValue({ fieldId: 'custpage_end_date' });
        // const qty = parseInt(rec.getValue({ fieldId: 'custpage_quantity' }) as string, 10);
        const qty = parseInt(String(rec.getValue({ fieldId: 'custpage_quantity' })), 10) || 0;
        const freq = rec.getValue({ fieldId: 'custpage_release_freq' });
        const sublistId = 'custpage_schedule_sublist';
        if (!sd || !ed || isNaN(qty) || !freq) {
            alert('Please fill all required fields.');
            return;
        }
        const freqDays = { e: 1, b: 7, c: 15, a: 30, d: 90, y: 365 };
        const interval = freqDays[freq] || 1;
        const msPerDay = 86400000;
        const end = new Date(ed);
        let latestDate = null;
        let existingTotal = 0;
        const lineCount = rec.getLineCount({ sublistId });
        for (let i = 0; i < lineCount; i++) {
            const lineQty = parseInt(rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_release_qty',
                line: i
            }), 10) || 0;
            const lineDateStr = rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_release_date',
                line: i
            });
            const lineDate = new Date(lineDateStr);
            if (!isNaN(lineDate.getTime()) && (!latestDate || lineDate > latestDate)) {
                latestDate = lineDate;
            }
            existingTotal += lineQty;
        }
        if (existingTotal >= qty) {
            alert(`Total quantity in sublist (${existingTotal}) is equal to or exceeds total quantity (${qty}). Auto-generation not needed.`);
            return;
        }
        const remainingQty = qty - existingTotal;
        let start = latestDate ? new Date(latestDate.getTime() + msPerDay) : new Date(sd);
        const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
        if (totalDays <= 0) {
            alert('Date range too short or end date is before start date.');
            return;
        }
        const chunks = Math.floor(totalDays / interval);
        if (chunks === 0) {
            alert('Date range too short for selected frequency.');
            return;
        }
        const baseQty = Math.floor(remainingQty / chunks);
        const remainder = remainingQty % chunks;
        for (let i = 0; i < chunks; i++) {
            rec.selectNewLine({ sublistId });
            rec.setCurrentSublistValue({
                sublistId,
                fieldId: 'custpage_release_date',
                value: start
            });
            rec.setCurrentSublistValue({
                sublistId,
                fieldId: 'custpage_release_qty',
                value: i === 0 ? baseQty + remainder : baseQty
            });
            rec.commitLine({ sublistId });
            start = new Date(start.getTime() + interval * msPerDay);
        }
        const Count = rec.getLineCount({ sublistId });
        const manual = Count - chunks;
        dialog_1.default.alert({
            title: 'Auto Schedule Generated',
            message: `Autogenerated Schedule: ${chunks}\nManually generated: ${manual}`
        });
        window.isGenerated = true;
    }
    exports.autoGenerateSchedule = autoGenerateSchedule;
    function addOneDay(date) {
        if (!date)
            return '';
        const d = new Date(date);
        d.setDate(d.getDate() + 1); // ✅ Add 1 day
        return d.toISOString(); // Store as ISO if you're already using ISO format
    }
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
                const rawDate = rec.getSublistValue({
                    sublistId: 'custpage_schedule_sublist',
                    fieldId: 'custpage_release_date',
                    line: i
                });
                const qtyStr = rec.getSublistValue({
                    sublistId: 'custpage_schedule_sublist',
                    fieldId: 'custpage_release_qty',
                    line: i
                });
                const date = rawDate;
                const qty = parseInt(qtyStr, 10);
                if (date && !isNaN(qty)) {
                    scheduleData.push({ date, qty });
                }
            }
            if (!scheduleCode || !itemId || scheduleData.length === 0) {
                alert('Missing required data.');
                return;
            }
            const scriptUrl = '/app/site/hosting/scriptlet.nl?script=152&deploy=1';
            fetch(scriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId,
                    scheduleCode,
                    scheduleData,
                    startDate: rec.getValue({ fieldId: 'custpage_start_date' }),
                    endDate: rec.getValue({ fieldId: 'custpage_end_date' }),
                    quantity: rec.getValue({ fieldId: 'custpage_quantity' }),
                    releaseFreq: rec.getValue({ fieldId: 'custpage_release_freq' })
                })
            })
                .then(response => response.json())
                .then(result => {
                if (result.success) {
                    alert('Schedule cached successfully.');
                    //window.close();
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
    function saveRecord(context) {
        const currentRecord = context.currentRecord;
        const date = currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_schedule_sublist',
            fieldId: 'custpage_release_date'
        });
        const qty = currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_schedule_sublist',
            fieldId: 'custpage_release_qty'
        });
        if (date || qty) {
            currentRecord.commitLine({ sublistId: 'custpage_schedule_sublist' });
        }
        const totalRows = currentRecord.getLineCount({
            sublistId: 'custpage_schedule_sublist'
        });
        let totalQty = 0;
        const startDate = (new Date(currentRecord.getValue({ fieldId: 'custpage_start_date' })));
        const endDate = (new Date(currentRecord.getValue({ fieldId: 'custpage_end_date' })));
        for (let i = 0; i < totalRows; i++) {
            const releaseDateStr = currentRecord.getSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_date',
                line: i
            });
            const releaseQty = parseInt(String(currentRecord.getSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_qty',
                line: i
            })), 10) || 0;
            const releaseDate = new Date(releaseDateStr);
            if (releaseDate < startDate || releaseDate > endDate) {
                dialog_1.default.alert({
                    title: 'Invalid Release Date',
                    message: `Please Check:\n Line ${i + 1}: Release date ${releaseDateStr} must be between Start (${startDate.toDateString()}) and End (${endDate.toDateString()}).`
                });
                return false;
            }
            totalQty += releaseQty;
        }
        const inputQty = parseInt(String(currentRecord.getValue({
            fieldId: 'custpage_quantity'
        })), 10) || 0;
        if (totalQty !== inputQty) {
            dialog_1.default.alert({
                title: 'Quantity Mismatch',
                message: `Please Check:\n Total scheduled quantity (${totalQty}) must exactly match the entered quantity (${inputQty}).`
            });
            return false;
        }
        saveScheduleToCache(); // Save to cache
        return true;
    }
    exports.saveRecord = saveRecord;
});

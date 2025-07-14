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
define(["require", "exports", "N/ui/dialog", "N/currentRecord"], function (require, exports, dialog_1, currentRecord) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.saveRecord = exports.saveScheduleToCache = exports.autoGenerateSchedule = exports.pageInit = exports.fieldChanged = exports.exportScheduleToCSV = void 0;
    dialog_1 = __importDefault(dialog_1);
    currentRecord = __importStar(currentRecord);
    window.isGenerated = false;
    function injectProgressBar() {
        if (document.getElementById('progress-modal'))
            return; // Prevent duplicates
        const modal = document.createElement('div');
        modal.id = 'progress-modal';
        modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;
        z-index: 9999;
    `;
        modal.innerHTML = `
        <div style="background: white; padding: 20px 30px; border-radius: 10px; text-align: center; width: 300px;">
            <h3 style="margin-bottom: 15px;">Generating Schedule...</h3>
            <div style="background: #eee; height: 20px; border-radius: 10px; overflow: hidden;">
                <div id="progress-bar" style="width: 0%; height: 100%; background: #4caf50;"></div>
            </div>
            <p id="progress-label" style="margin-top: 10px;">0%</p>
        </div>
    `;
        document.body.appendChild(modal);
    }
    function updateProgressBar(percent) {
        const bar = document.getElementById('progress-bar');
        const label = document.getElementById('progress-label');
        if (bar && label) {
            bar.style.width = `${percent}%`;
            label.textContent = `${percent.toFixed(0)}%`;
        }
    }
    function removeProgressBar() {
        const modal = document.getElementById('progress-modal');
        if (modal)
            modal.remove();
    }
    function exportScheduleToCSV() {
        const rec = currentRecord.get();
        const sublistId = 'custpage_schedule_sublist';
        const itemId = rec.getValue({ fieldId: 'custpage_item_id' }) || '';
        const customer = rec.getValue({ fieldId: 'custpage_customer' }) || '';
        const project = rec.getValue({ fieldId: 'custpage_project' }) || '';
        const location = rec.getValue({ fieldId: 'custpage_location' }) || '';
        const startDate = rec.getValue({ fieldId: 'custpage_start_date' }) || '';
        const endDate = rec.getValue({ fieldId: 'custpage_end_date' }) || '';
        const quantity = rec.getValue({ fieldId: 'custpage_quantity' }) || '';
        const bsoId = rec.getValue({ fieldId: 'custpage_bso_id' }) || '';
        let csv = '';
        csv += `BSO ID,${bsoId}\n`;
        csv += `Customer,${customer}\n`;
        csv += `Project,${project}\n`;
        csv += `Location,${location}\n`;
        csv += `Item ID,${itemId}\n`;
        csv += `Start Date,${startDate}\n`;
        csv += `End Date,${endDate}\n`;
        csv += `Quantity,${quantity}\n`;
        csv += '\n';
        csv += 'Release Date,Quantity,Sales Order URL\n';
        const lineCount = rec.getLineCount({ sublistId });
        for (let i = 0; i < lineCount; i++) {
            const date = rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_release_date',
                line: i
            }) || '';
            const qty = rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_release_qty',
                line: i
            }) || '';
            const link = rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_sales_order_link',
                line: i
            }) || '';
            csv += `"${date}","${qty}","${link}"\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schedule_export.csv';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    exports.exportScheduleToCSV = exportScheduleToCSV;
    function fieldChanged(context) {
        const { sublistId, fieldId } = context;
        if (sublistId !== 'custpage_schedule_sublist' || fieldId !== 'custpage_so_open_checkbox') {
            return;
        }
        const rec = currentRecord.get();
        const isChecked = rec.getCurrentSublistValue({
            sublistId,
            fieldId: 'custpage_so_open_checkbox'
        });
        const soUrl = rec.getCurrentSublistValue({
            sublistId,
            fieldId: 'custpage_sales_order_link'
        });
        if (!isChecked || !soUrl || !soUrl.startsWith('http')) {
            return;
        }
        // Open in a new tab or window (standard browser behavior)
        window.open(soUrl, '_blank');
        // Uncheck the checkbox after opening
        rec.setCurrentSublistValue({
            sublistId,
            fieldId: 'custpage_so_open_checkbox',
            value: false
        });
        rec.commitLine({ sublistId });
    }
    exports.fieldChanged = fieldChanged;
    ;
    function pageInit(context) {
        // ✅ Populate fields and schedule lines
        try {
            const rec = currentRecord.get();
            if (window.scheduleMeta) {
                const m = window.scheduleMeta;
                if (m.startDate)
                    rec.setValue({ fieldId: 'custpage_start_date', value: m.startDate });
                if (m.endDate)
                    rec.setValue({ fieldId: 'custpage_end_date', value: m.endDate });
                if (m.quantity)
                    rec.setValue({ fieldId: 'custpage_quantity', value: parseInt(m.quantity, 10) });
                if (m.releaseFreq)
                    rec.setValue({ fieldId: 'custpage_release_freq', value: m.releaseFreq });
            }
            const sublistId = 'custpage_schedule_sublist';
            if (Array.isArray(window.scheduleLines) && window.scheduleLines.length > 0) {
                window.scheduleLines.forEach((entry) => {
                    if (!entry.date || !entry.qty)
                        return;
                    rec.selectNewLine({ sublistId });
                    rec.setCurrentSublistValue({ sublistId, fieldId: 'custpage_release_date', value: entry.date });
                    rec.setCurrentSublistValue({ sublistId, fieldId: 'custpage_release_qty', value: entry.qty });
                    // ➜ Store only SO ID in this field
                    rec.setCurrentSublistValue({
                        sublistId,
                        fieldId: 'custpage_sales_order_link',
                        value: entry.salesOrderId || ''
                    });
                    rec.commitLine({ sublistId });
                });
                window.isGenerated = true;
            }
            else {
                window.isGenerated = false;
            }
        }
        catch (e) {
            console.error('pageInit error:', e.message);
        }
    }
    exports.pageInit = pageInit;
    /*export function autoGenerateSchedule() {
        if (window.isGenerated) {
            alert('Schedule has already been auto-generated.');
            return;
        }
    
        const rec = currentRecord.get();
        const sd = rec.getValue({ fieldId: 'custpage_start_date' }) as string;
        const ed = rec.getValue({ fieldId: 'custpage_end_date' }) as string;
        // const qty = parseInt(rec.getValue({ fieldId: 'custpage_quantity' }) as string, 10);
        const qty = parseInt(String(rec.getValue({ fieldId: 'custpage_quantity' })), 10) || 0;
    
    
        const freq = rec.getValue({ fieldId: 'custpage_release_freq' }) as string;
        const sublistId = 'custpage_schedule_sublist';
    
        if (!sd || !ed || isNaN(qty) || !freq) {
            alert('Please fill all required fields.');
            return;
        }
    
        const freqDays: Record<string, number> = { e: 1, b: 7, c: 15, a: 30, d: 90, y: 365 };
        const interval = freqDays[freq] || 1;
        const msPerDay = 86400000;
    
        const end = new Date(ed);
        let latestDate: Date | null = null;
        let existingTotal = 0;
    
        const lineCount = rec.getLineCount({ sublistId });
        for (let i = 0; i < lineCount; i++) {
            const lineQty = parseInt(rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_release_qty',
                line: i
            }) as string, 10) || 0;
    
            const lineDateStr = rec.getSublistValue({
                sublistId,
                fieldId: 'custpage_release_date',
                line: i
            }) as string;
    
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
    
        let start = latestDate ? new Date(latestDate.getTime() + interval*msPerDay) : new Date(sd);
        const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay)+1;
    
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
                value: i < remainder ? baseQty + 1 : baseQty
            });
            rec.commitLine({ sublistId });
            start = new Date(start.getTime() + interval * msPerDay);
        }
        const Count = rec.getLineCount({ sublistId });
        const manual=Count-chunks;
        dialog.alert({
            title: 'Auto Schedule Generated',
            message: `Autogenerated Schedule: ${chunks}\nManually generated: ${manual}`
        });
        window.isGenerated = true;
    }*/
    async function autoGenerateSchedule() {
        if (window.isGenerated) {
            alert('Schedule has already been auto-generated.');
            return;
        }
        const rec = currentRecord.get();
        const sublistId = 'custpage_schedule_sublist';
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
        let start = latestDate ? new Date(latestDate.getTime() + interval * msPerDay) : new Date(sd);
        const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
        const chunks = Math.ceil(totalDays / interval);
        if (chunks === 0 || chunks > 1000) {
            dialog_1.default.alert({
                title: chunks === 0 ? 'Invalid Date Range' : 'Data Limit Exceeded',
                message: chunks === 0
                    ? 'Date range too short for selected frequency.'
                    : 'Schedule data is too large. Please reduce the date range.'
            });
            return;
        }
        const baseQty = Math.floor(remainingQty / chunks);
        const remainder = remainingQty % chunks;
        // Inject and show progress bar
        injectProgressBar();
        for (let i = 0; i < chunks; i++) {
            const releaseQty = i < remainder ? baseQty + 1 : baseQty;
            rec.selectNewLine({ sublistId });
            rec.setCurrentSublistValue({
                sublistId,
                fieldId: 'custpage_release_date',
                value: new Date(start)
            });
            rec.setCurrentSublistValue({
                sublistId,
                fieldId: 'custpage_release_qty',
                value: releaseQty
            });
            rec.commitLine({ sublistId });
            if (freq === 'a') {
                start = addMonths(start, 1);
            }
            else if (freq === 'd') {
                start = addMonths(start, 3);
            }
            else {
                start = new Date(start.getTime() + interval * msPerDay);
            }
            // Smooth UI refresh using await
            if (i % 10 === 0) {
                const percent = ((i + 1) / chunks) * 100;
                updateProgressBar(percent);
                await new Promise(resolve => setTimeout(resolve, 1)); // brief pause to update UI
            }
        }
        removeProgressBar();
        const totalLines = rec.getLineCount({ sublistId });
        const manual = totalLines - chunks;
        dialog_1.default.alert({
            title: 'Automatic Schedule Creation',
            message: `Schedule Generated Successfully`
        });
        window.isGenerated = true;
    }
    exports.autoGenerateSchedule = autoGenerateSchedule;
    function saveScheduleToCache() {
        try {
            const rec = currentRecord.get();
            const context = { currentRecord: rec };
            const isValid = saveRecord(context);
            if (!isValid)
                return;
            const scheduleCode = rec.getValue({ fieldId: 'custpage_schedule_code' });
            const itemId = rec.getValue({ fieldId: 'custpage_item_id' });
            const bsoId = rec.getValue({ fieldId: 'custpage_bso_id' });
            const startDate = formatLocalDate(rec.getValue({ fieldId: 'custpage_start_date' }));
            const endDate = formatLocalDate(rec.getValue({ fieldId: 'custpage_end_date' }));
            const quantity = rec.getValue({ fieldId: 'custpage_quantity' });
            const releaseFreq = rec.getValue({ fieldId: 'custpage_release_freq' });
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
                const salesOrderUrl = rec.getSublistValue({
                    sublistId: 'custpage_schedule_sublist',
                    fieldId: 'custpage_sales_order_link',
                    line: i
                });
                const qty = parseInt(String(qtyStr), 10);
                let salesOrderId = '';
                if (typeof salesOrderUrl === 'string') {
                    const match = salesOrderUrl.match(/id=(\d+)/);
                    if (match)
                        salesOrderId = match[1];
                }
                // extract ID from URL
                if (rawDate && !isNaN(qty)) {
                    scheduleData.push({
                        date: formatLocalDate(rawDate),
                        qty,
                        salesOrderId
                    });
                }
            }
            if (!itemId || scheduleData.length === 0) {
                alert('Missing required data.');
                return;
            }
            const scriptUrl = '/app/site/hosting/scriptlet.nl?script=152&deploy=1';
            const payload = {
                itemId, bsoId, scheduleCode, startDate, endDate, quantity, releaseFreq, scheduleData
            };
            fetch(scriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(response => response.json())
                .then(result => {
                console.log('Save result:', result);
                if (result.success) {
                    dialog_1.default.alert({
                        title: 'Schedule Generated',
                        message: `All Schedule Saved Successfully.`,
                    });
                }
                else {
                    alert('Error: ' + result.message);
                }
            })
                .catch(e => alert('Fetch error: ' + e.message));
        }
        catch (e) {
            alert('Client error: ' + e.message);
        }
    }
    exports.saveScheduleToCache = saveScheduleToCache;
    // Helper: Convert to M/D/YYYY format (NetSuite-native)
    function formatLocalDate(input) {
        const d = new Date(input);
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const y = d.getFullYear();
        return `${m}/${day}/${y}`;
    }
    function addMonths(date, months) {
        const d = new Date(date);
        const day = d.getDate();
        d.setMonth(d.getMonth() + months);
        if (d.getDate() < day) {
            d.setDate(0);
        }
        return d;
    }
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
        var previousReleaseDate = null;
        const startDate = new Date(currentRecord.getValue({ fieldId: 'custpage_start_date' }));
        const endDate = new Date(currentRecord.getValue({ fieldId: 'custpage_end_date' }));
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
            if (previousReleaseDate && releaseDate <= previousReleaseDate) {
                dialog_1.default.alert({
                    title: 'Release Date Order Error',
                    message: `Please Check:\n Line ${i + 1}: Release date ${releaseDateStr} should be after the previous date (${previousReleaseDate.toDateString()}).`
                });
                return false;
            }
            // Track last date for next iteration comparison
            previousReleaseDate = releaseDate;
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
        return true;
    }
    exports.saveRecord = saveRecord;
});

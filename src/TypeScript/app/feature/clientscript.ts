/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import * as currentRecord from 'N/currentRecord';

export function pageInit(context: any) {}

let isGenerated = false; // Prevent multiple clicks

export function autoGenerateSchedule() {
    if (isGenerated) {
        alert('Schedule has already been auto-generated.');
        return;
    }

    const rec = currentRecord.get();
    const sd = rec.getValue({ fieldId: 'custpage_start_date' }) as string;
    const ed = rec.getValue({ fieldId: 'custpage_end_date' }) as string;
    const qty = parseInt(rec.getValue({ fieldId: 'custpage_quantity' }) as string, 10);
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

    // Determine start date: after last manual release, or use original start date
    let start = latestDate ? new Date(latestDate.getTime() + msPerDay) : new Date(sd);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);

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
        start = new Date(start.getTime() + interval * msPerDay);

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
    }

    isGenerated = true; // Lock further generation
}


export function saveScheduleToCache() {
    try {
        if (event) event.preventDefault();
        const rec = currentRecord.get();
        const scheduleCode = rec.getValue({ fieldId: 'custpage_schedule_code' }) as string;
        const itemId = rec.getValue({ fieldId: 'custpage_item_id' }) as string;

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
            if (date && qty) scheduleData.push({ date, qty });
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
                } else {
                    alert('Server error: ' + (result.message || 'Unknown error'));
                }
            })
            .catch(e => alert('Fetch error: ' + e.message));

    } catch (e: any) {
        alert('Client error: ' + e.message);
    }
}

export function saveRecord(context: any): boolean {
    return saveScheduleToCache();
}
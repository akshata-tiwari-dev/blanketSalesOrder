/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import * as currentRecord from 'N/currentRecord';
import dialog from 'N/ui/dialog';
declare global {
    interface Window {
        isGenerated?: boolean;
        scheduleMeta?: {
            startDate?: string;
            endDate?: string;
            quantity?: string;
            releaseFreq?: string;
        };
        scheduleLines?: Array<{ date: string; qty: number }>;
    }
}

window.isGenerated = false;


export function pageInit(context: any) {
    try {
        const rec = currentRecord.get();

        // Preload meta fields
        if (window.scheduleMeta) {
            const meta = window.scheduleMeta;
            if (meta.startDate) rec.setValue({ fieldId: 'custpage_start_date', value: meta.startDate });
            if (meta.endDate) rec.setValue({ fieldId: 'custpage_end_date', value: meta.endDate });
            if (meta.quantity) rec.setValue({ fieldId: 'custpage_quantity', value: parseInt(meta.quantity, 10) });
            if (meta.releaseFreq) rec.setValue({ fieldId: 'custpage_release_freq', value: meta.releaseFreq });
        }

        // Preload sublist entries
        const sublistId = 'custpage_schedule_sublist';
        if (Array.isArray(window.scheduleLines) && window.scheduleLines.length > 0) {
            window.scheduleLines.forEach((entry: { date: string; qty: number }) => {
                if (!entry?.date || !entry?.qty) return;
                rec.selectNewLine({ sublistId });
                rec.setCurrentSublistValue({ sublistId, fieldId: 'custpage_release_date', value: entry.date });
                rec.setCurrentSublistValue({ sublistId, fieldId: 'custpage_release_qty', value: entry.qty });
                rec.commitLine({ sublistId });
            });

            // ✅ Mark as already generated
            window.isGenerated = true;
        } else {
            window.isGenerated = false;
        }
    } catch (e: any) {
        console.error('Preload failed:', e.message || e);
    }
}

export function autoGenerateSchedule() {
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

    let start = latestDate ? new Date(latestDate.getTime() + msPerDay) : new Date(sd);
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
            value: i === 0 ? baseQty + remainder : baseQty
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
            const rawQty = rec.getSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_qty',
                line: i
            });
            const qty = parseInt(String(rawQty), 10) || 0;

            if (date && qty) scheduleData.push({ date, qty });
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
            dialog.alert({
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
        dialog.alert({
            title: 'Quantity Mismatch',
            message: `Please Check:\n Total scheduled quantity (${totalQty}) must exactly match the entered quantity (${inputQty}).`
        });
        return false;
    }

    saveScheduleToCache(); // Save to cache
    return true;
}







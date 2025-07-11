/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import * as currentRecord from 'N/currentRecord';
import * as log from 'N/log';
import dialog from 'N/ui/dialog';
declare function nlExtOpenWindow(url: string, name: string, width: number, height: number): void;

declare global {
    interface Window {
        isGenerated?: boolean;
        scheduleMeta?: {
            startDate?: string;
            endDate?: string;
            quantity?: string;
            releaseFreq?: string;
        };
        scheduleLines?: Array<{ date: string; qty: number; salesOrderId?: string }>;
    }
}


window.isGenerated = false;


export const fieldChanged: ClientScript['fieldChanged'] = (context) => {
    const { sublistId, fieldId, line } = context;

    if (sublistId === 'custpage_schedule_sublist' && fieldId === 'custpage_so_open_checkbox') {
        const rec = currentRecord.get();
        const isChecked = rec.getCurrentSublistValue({
            sublistId,
            fieldId: 'custpage_so_open_checkbox'
        }) as boolean;

        const soUrl = rec.getCurrentSublistValue({
            sublistId,
            fieldId: 'custpage_sales_order_link'
        }) as string;

        if (isChecked && soUrl && soUrl.startsWith('http')) {
            nlExtOpenWindow(soUrl, 'View SO', 1000, 800);

            rec.setCurrentSublistValue({
                sublistId,
                fieldId: 'custpage_so_open_checkbox',
                value: false
            });

            rec.commitLine({ sublistId });
        }
    }
};


export function pageInit(context: any) {

    // ✅ Populate fields and schedule lines
    try {
        const rec = currentRecord.get();

        if (window.scheduleMeta) {
            const m = window.scheduleMeta;
            if (m.startDate) rec.setValue({ fieldId: 'custpage_start_date', value: m.startDate });
            if (m.endDate) rec.setValue({ fieldId: 'custpage_end_date', value: m.endDate });
            if (m.quantity) rec.setValue({ fieldId: 'custpage_quantity', value: parseInt(m.quantity, 10) });
            if (m.releaseFreq) rec.setValue({ fieldId: 'custpage_release_freq', value: m.releaseFreq });
        }

        const sublistId = 'custpage_schedule_sublist';
        if (Array.isArray(window.scheduleLines) && window.scheduleLines.length > 0) {
            window.scheduleLines.forEach((entry: { date: string; qty: number; salesOrderId?: string }) => {
                if (!entry.date || !entry.qty) return;

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
        } else {
            window.isGenerated = false;
        }
    } catch (e: any) {
        console.error('pageInit error:', e.message);
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
        const rec = currentRecord.get();
        const context = { currentRecord: rec };
        const isValid = saveRecord(context);
        if (!isValid) return;

        const scheduleCode = rec.getValue({ fieldId: 'custpage_schedule_code' }) as string;
        const itemId = rec.getValue({ fieldId: 'custpage_item_id' }) as string;
        const bsoId = rec.getValue({ fieldId: 'custpage_bso_id' }) as string;

        const startDate = formatLocalDate(rec.getValue({ fieldId: 'custpage_start_date' }));
        const endDate = formatLocalDate(rec.getValue({ fieldId: 'custpage_end_date' }));
        const quantity = rec.getValue({ fieldId: 'custpage_quantity' });
        const releaseFreq = rec.getValue({ fieldId: 'custpage_release_freq' });

        const lines = rec.getLineCount({ sublistId: 'custpage_schedule_sublist' });
        const scheduleData: Array<{ date: string; qty: number; salesOrderId?: string }> = [];

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

            const qty = parseInt(qtyStr, 10);
            let salesOrderId = '';
            if (typeof salesOrderUrl === 'string') {
                const match = salesOrderUrl.match(/id=(\d+)/);
                if (match) salesOrderId = match[1];
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
                    dialog.alert({
                        title: 'Schedule Generated',
                        message: `All Schedule Saved Successfully.`,
                    });

                } else {
                    alert('Error: ' + result.message);
                }
            })
            .catch(e => alert('Fetch error: ' + e.message));
    } catch (e: any) {
        alert('Client error: ' + e.message);
    }
}




// ✅ Helper: Convert to M/D/YYYY format (NetSuite-native)
function formatLocalDate(input: any): string {
    const d = new Date(input);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const y = d.getFullYear();
    return `${m}/${day}/${y}`;
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


    return true;
}







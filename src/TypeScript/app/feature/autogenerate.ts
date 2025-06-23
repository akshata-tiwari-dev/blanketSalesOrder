/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
 */
import * as ui from 'N/ui/message';
export function pageInit(context: any) {}
export function autoGenerateSchedule() {
    try {/*
        const startDateStr = (document.getElementById('start') as HTMLInputElement).value;
        const endDateStr = (document.getElementById('end') as HTMLInputElement).value;
        const totalQty = parseInt((document.getElementById('custrecord18') as HTMLInputElement).value, 10);
        if (!startDateStr || !endDateStr || isNaN(totalQty)) {
            alert('Please fill Start Date, End Date, and Quantity.');
            return;
        }
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        if (endDate <= startDate) {
            alert('End Date must be after Start Date.');
            return;
        }
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
        const qtyPerMonth = Math.floor(totalQty / monthsDiff);
        const remainder = totalQty % monthsDiff;
        const sublistTable = document.querySelector('[id^="sublist_"]') as HTMLTableElement;
        while (sublistTable.rows.length > 1) sublistTable.deleteRow(1);
        for (var i = 0; i < monthsDiff; i++) {
            const releaseDate = new Date(startDate);
            releaseDate.setMonth(releaseDate.getMonth() + i);
            const qty = i === 0 ? qtyPerMonth + remainder : qtyPerMonth;
            const row = sublistTable.insertRow(-1);
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            cell1.innerHTML = releaseDate.toISOString().slice(0, 10); // YYYY-MM-DD
            cell2.innerHTML = qty.toString();
        };*/
    } catch (e) {
        alert('Error generating schedule: ' + e.message);
    }
}
/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import * as ui from 'N/ui/message';
import * as currentRecord from 'N/currentRecord';
import * as format from 'N/format';
import * as serverWidget from 'N/ui/serverWidget';
export function pageInit(context: any) {}
export function autoGenerateSchedule() {
    try {

        var rec = currentRecord.get();

        var startDateStr = rec.getValue({ fieldId: 'custpage_start_date' }) as string;
        var endDateStr = rec.getValue({ fieldId: 'custpage_end_date' }) as string;
        var totalQty = parseInt(rec.getValue({ fieldId: 'custpage_quantity' }) as string, 10);
        if (!startDateStr || !endDateStr || isNaN(totalQty)) {
            alert('Please fill Start Date, End Date, and Quantity.');
            return;
        }
        var startDate = new Date(startDateStr);
        var endDate = new Date(endDateStr);
        if (endDate <= startDate) {
            alert('End Date must be after Start Date.');
            return;
        }
        var monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) ;
        var need=24*3600*30*1000;
        // var weekDiff=Math.ceil((endDate.getFullYear() - startDate.getFullYear())/need);
        // alert(monthsDiff);
        /* const lineCount = rec.getLineCount({ sublistId: 'custpage_schedule_sublist' });
         for (let i = lineCount - 1; i >= 0; i--) {
             //  rec.removeLine({ sublistId: 'custpage_schedule_sublist', line: i, ignoreRecalc: true });
             var q=rec.getCurrentSublistValue({
                 sublistId: 'custpage_schedule_sublist',
                 fieldId: 'custpage_release_date',
                // value: releaseDate // YYYY-MM-DD
             });
         }*/
        var qtyPerMonth = Math.floor(totalQty / monthsDiff);
        var remainder = totalQty % monthsDiff;


        var releaseDate = new Date(startDate);

        var x=need;
        for (var i = 0; i < monthsDiff; i++) {

            releaseDate.setTime(releaseDate.getTime() + x);
            const qty = i === 0 ? qtyPerMonth + remainder : qtyPerMonth;
            rec.selectNewLine({ sublistId: 'custpage_schedule_sublist' });
            var id='remach_custpage_schedule_sublist';
            rec.setCurrentSublistValue({
                sublistId: 'id',
                fieldId: 'custpage_release_date',
                value: releaseDate // YYYY-MM-DD
            });
            rec.setCurrentSublistValue({
                sublistId: 'id',
                fieldId: 'custpage_release_qty',
                value: qty
            });

            rec.commitLine({ sublistId: 'custpage_schedule_sublist' });
        }
        // alert(`Auto-generated ${monthsDiff} release(s).`);
    }
    catch (e:any) {
        alert('Error generating schedule: ' + e.message);
    }
}
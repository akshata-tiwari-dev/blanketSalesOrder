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
        //var itemid = rec.getValue({ fieldId: 'custpage_item_id' }) as string;
        var totalQty = parseInt(rec.getValue({ fieldId: 'custpage_quantity' }) as string, 10);
        if (!startDateStr || !endDateStr || isNaN(totalQty)) {
            alert('Please fill Start Date, End Date, and Quantity.');
            return;
        }
        var startDate = new Date(startDateStr);
        const lineCount = rec.getLineCount({ sublistId: 'custpage_schedule_sublist' });
        for (let i = 0; i <lineCount; i++) {
            //  rec.removeLine({ sublistId: 'custpage_schedule_sublist', line: i, ignoreRecalc: true });
            var q=rec.getSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_date',
                line:i
                // value: releaseDate // YYYY-MM-DD
            });
            var qtyy=rec.getSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_qty',
                line:i
                // value: releaseDate // YYYY-MM-DD
            });
            startDate= new Date(q);
            totalQty-=qtyy;
        };
        var endDate = new Date(endDateStr);
        if (endDate <= startDate) {
            alert('End Date must be after Start Date.');
            return;
        }

        var frequency=rec.getValue({ fieldId: 'custpage_release_freq'});
        var divison:number;
        if(frequency=='e'){
            divison=1;
        }
        else if(frequency=='b'){
            divison=7;
        }
        else if(frequency=='c'){
            divison=15;
        }
        else if(frequency=='a'){
            divison=30;
        }
        else if(frequency=='d'){
            divison=90;
        }
        else{
            divison=365;
        }
       //var monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) ;
        var need=24*3600*1000;
        var TotalDays = (endDate.getTime() - startDate.getTime())/need;
        //alert(monthsDiff);

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
        var differ= Math.floor(TotalDays/divison);
        var qtyPerDiv = Math.floor(totalQty /differ);
        var remainder = totalQty % differ;


        var releaseDate = new Date(startDate);
        var rddiff=need*divison;

        var x=need;
        for (var i = 0; i < differ; i++) {

            releaseDate.setTime(releaseDate.getTime() + rddiff);
            const qty = i === 0 ? qtyPerDiv + remainder : qtyPerDiv;
            rec.selectNewLine({ sublistId: 'custpage_schedule_sublist' });
           /* rec.setCurrentSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_item_id',
                value:i+1
            });*/
            rec.setCurrentSublistValue({
                sublistId: 'custpage_schedule_sublist',
                fieldId: 'custpage_release_date',
                value: releaseDate // YYYY-MM-DD
            });
            rec.setCurrentSublistValue({
                sublistId: 'custpage_schedule_sublist',
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

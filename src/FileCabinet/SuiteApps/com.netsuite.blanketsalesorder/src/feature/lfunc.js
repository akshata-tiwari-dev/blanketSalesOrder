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
    exports.autoGenerateSchedule = exports.pageInit = void 0;
    currentRecord = __importStar(currentRecord);
    function pageInit(context) { }
    exports.pageInit = pageInit;
    function autoGenerateSchedule() {
        try {
            var rec = currentRecord.get();
            var startDateStr = rec.getValue({ fieldId: 'custpage_start_date' });
            var endDateStr = rec.getValue({ fieldId: 'custpage_end_date' });
            var totalQty = parseInt(rec.getValue({ fieldId: 'custpage_quantity' }), 10);
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
            var monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
            var need = 24 * 3600 * 30 * 1000;
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
            var x = need;
            for (var i = 0; i < monthsDiff; i++) {
                releaseDate.setTime(releaseDate.getTime() + x);
                const qty = i === 0 ? qtyPerMonth + remainder : qtyPerMonth;
                rec.selectNewLine({ sublistId: 'custpage_schedule_sublist' });
                var id = 'remach_custpage_schedule_sublist';
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
        catch (e) {
            alert('Error generating schedule: ' + e.message);
        }
    }
    exports.autoGenerateSchedule = autoGenerateSchedule;
});

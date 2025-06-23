/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet

 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/ui/serverWidget"], function (require, exports, serverWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    serverWidget_1 = __importDefault(serverWidget_1);
    function onRequest(context) {
        if (context.request.method === 'GET') {
            const form = serverWidget_1.default.createForm({
                title: 'Schedule'
            });
            const sel = form.addField({
                id: 'createsalesorders',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'CREATE SALES ORDERS'
            });
            sel.addSelectOption({
                value: 'a',
                text: 'Manually'
            });
            sel.addSelectOption({
                value: 'b',
                text: 'At lead time'
            });
            const select_f = form.addField({
                id: 'createschedule',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'Create schedule'
            });
            select_f.addSelectOption({
                value: 'c',
                text: 'Manually'
            });
            select_f.addSelectOption({
                value: 'd',
                text: 'Auto Generate'
            });
            const select_g = form.addField({
                id: 'release',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'Release frequency'
            });
            select_g.addSelectOption({
                value: 'm',
                text: 'Monthly'
            });
            select_g.addSelectOption({
                value: 'w',
                text: 'Weekly'
            });
            select_g.addSelectOption({
                value: 'qu',
                text: 'Quaterly'
            });
            /*
                    const selectr = form.addField({
                        id: 'Release',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Release frequency'
                    });
                    var p=selectr.addSelectOption({
                        value: 'p',
                        text: 'Monthly'
                    });
                    var q=selectr.addSelectOption({
                        value: 'q',
                        text: 'Weekly'
                    });
                    var r=selectr.addSelectOption({
                        value: 'r',
                        text: 'Quarterly'
                    });
            */
            const st = form.addField({
                id: 'start',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'Start Date'
            });
            const end = form.addField({
                id: 'end',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'End Date'
            });
            //form.clientScriptModulePath = 'SuiteScripts/DialogClientScript.js';
            var ab = form.addButton({
                id: 'clear',
                label: 'Clear All Lines',
                //functionName: 'showDialog'
            });
            var bb = form.addButton({
                id: 'autoGen',
                label: 'Auto Generate',
                // functionName: 'autoGenerateSchedule()'
            });
            var save = form.addSubmitButton({
                id: 'save',
                label: 'Save Data'
                //functionName: 'showDialog'
            });
            function autoGenerateSchedule() {
                try {
                    const startDateStr = document.getElementById('start').value;
                    const endDateStr = document.getElementById('end').value;
                    const totalQty = parseInt(document.getElementById('custrecord18').value, 10);
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
                    const sublistTable = document.querySelector('[id^="sublist_"]');
                    while (sublistTable.rows.length > 1)
                        sublistTable.deleteRow(1);
                    for (var i = 0; i < monthsDiff; i++) {
                        const releaseDate = new Date(startDate);
                        releaseDate.setMonth(releaseDate.getMonth() + i);
                        const qty = i === 0 ? qtyPerMonth + remainder : qtyPerMonth;
                        const row = sublistTable.insertRow(-1);
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        cell1.innerHTML = releaseDate.toISOString().slice(0, 10); // YYYY-MM-DD
                        cell2.innerHTML = qty.toString();
                    }
                    ;
                }
                catch (e) {
                    alert('Error generating schedule: ' + e.message);
                }
            }
            const sublist = form.addSublist({
                id: 'sublist_',
                type: serverWidget_1.default.SublistType.INLINEEDITOR,
                label: 'Schedule'
            });
            sublist.addField({
                id: 'rel',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'RELEASE'
            });
            sublist.addField({
                id: 'ord',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'ORDER'
            });
            sublist.addField({
                id: 'date',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'DATE'
            });
            sublist.addField({
                id: 'qty',
                type: serverWidget_1.default.FieldType.INTEGER,
                label: 'Quantity'
            });
            sublist.addField({
                id: 'memo',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'MEMO'
            });
            context.response.writePage(form);
        }
        else {
            /*const delimiter = /\u0001/;
            const textField = context.request.parameters.custpage_text;
            const dateField = context.request.parameters.custpage_date;
            const currencyField = context.request.parameters.custpage_currencyfield;
            const selectField = context.request.parameters.custpage_selectfield;
            const sublistData = context.request.parameters.sublistdata.split('-');
            const sublistField1 = sublistData[0];
            const sublistField2 = sublistData[1];
    
            context.response.write('You have entered: ' + textField + ' ' + dateField + ' '
                + currencyField + ' ' + selectField + ' ' + sublistField1 + ' ' + sublistField2);
        }*/
        }
        export = {
            onRequest: onRequest,
            //autoGenerateSchedule:autoGenerateSchedule
        };
    }
});

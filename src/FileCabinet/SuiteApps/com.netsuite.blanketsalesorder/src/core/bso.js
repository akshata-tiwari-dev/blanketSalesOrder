/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
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
define(["require", "exports", "N/ui/serverWidget", "N/url"], function (require, exports, serverWidget_1, url) {
    "use strict";
    serverWidget_1 = __importDefault(serverWidget_1);
    url = __importStar(url);
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget_1.default.createForm({
                title: 'Blanket Sales Order'
            });
            var bt1 = form.addSubmitButton({
                id: 'button1',
                label: 'SAVE'
            });
            var bt2 = form.addButton({
                id: 'button2',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'CANCEL',
            });
            var bt3 = form.addButton({
                id: 'button3',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'AUTO FILL',
            });
            var bt4 = form.addResetButton({
                id: 'button4',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'RESET',
            });
            var fieldgroup = form.addFieldGroup({
                id: 'fieldgroupid',
                label: 'Primary Information'
            });
            var bpofield = form.addField({
                id: 'custpage_textfield',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'Blanket Sales Order #',
                container: 'fieldgroupid'
            });
            var vendor = form.addField({
                id: 'vendor',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'Vendor',
                container: 'fieldgroupid'
            }).isMandatory = true;
            var vendor_id = form.addField({
                id: 'vendor_id',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'Vendor #',
                container: 'fieldgroupid'
            });
            var date = form.addField({
                id: 'date_',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'Date',
                container: 'fieldgroupid'
            }).isMandatory = true;
            var employee = form.addField({
                id: 'employee_',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'Employee',
                container: 'fieldgroupid'
            });
            var stdate = form.addField({
                id: 'stdate',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'Start Date',
                container: 'fieldgroupid'
            }).isMandatory = true;
            var enddate = form.addField({
                id: 'enddate',
                type: serverWidget_1.default.FieldType.DATE,
                label: 'End Date',
                container: 'fieldgroupid'
            });
            var maxamount = form.addField({
                id: 'maxamountid',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'Max Amount',
                container: 'fieldgroupid'
            });
            var memofield = form.addField({
                id: 'memoid',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'MEMO',
                container: 'fieldgroupid'
            });
            var newform = form.addField({
                id: 'nform',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'FORM',
                container: 'fieldgroupid'
            });
            var fieldgroup1 = form.addFieldGroup({
                id: 'fieldgroupid1',
                label: 'Classification'
            });
            var subsidary = form.addField({
                id: 'subsidary',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'SUBSIDARY',
                container: 'fieldgroupid1'
            }).isMandatory = true;
            var dept = form.addField({
                id: 'dept',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'DEPARTMENT',
                container: 'fieldgroupid1'
            });
            var docdate = form.addField({
                id: 'docdate',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'DOCUMENT DATE',
                container: 'fieldgroupid1'
            });
            var loc = form.addField({
                id: 'loc',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'LOCATION',
                container: 'fieldgroupid1'
            });
            var cls = form.addField({
                id: 'cls',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'CLASS',
                container: 'fieldgroupid1'
            });
            var ipn = form.addField({
                id: 'ipn',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'IMPORT PERMIT NO.',
                container: 'fieldgroupid1'
            });
            var item = form.addSubtab({
                id: 'items',
                label: 'Items'
            });
            var currency = form.addField({
                id: 'curr',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'CURRENCY.',
                container: 'items'
            });
            var exrate = form.addField({
                id: 'exrate',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'EXHANGE RATE ',
                container: 'items'
            }).isMandatory = true;
            var sub = form.addSublist({
                id: 'sub',
                type: serverWidget_1.default.SublistType.INLINEEDITOR,
                label: ' ',
                tab: 'item'
            });
            var f = sub.addField({
                id: 'f',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'CATAGORY',
            });
            var acc = sub.addField({
                id: 'acc',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'ACCOUNT',
            }).isMandatory = true;
            var amm = sub.addField({
                id: 'amm',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'AMMOUNT',
            });
            var mem = sub.addField({
                id: 'mem',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'MEMO',
            });
            var sch = sub.addField({
                id: 'sch',
                type: serverWidget_1.default.FieldType.SELECT,
                label: 'SCHEDULE',
            });
            var surl = url.resolveScript({
                scriptId: 'customscript1525',
                deploymentId: 'customdeploy1'
            }); /*
            sch.addSelectOption({
                value: 'gfhn',
                text: 'Manually',
                functionName: '(function() { window.location = "' + surl + '" })();'
            });*/
            var bt1 = form.addButton({
                id: 'custpage_suiteletbutton1',
                label: '+',
                functionName: '(function() { window.location = "' + surl + '" })();'
            });
            var terms = form.addSubtab({
                id: 'terms',
                label: 'Terms'
            });
            var blankterms = form.addField({
                id: 'bt',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'terms'
            });
            var spi = form.addSubtab({
                id: 'spi',
                label: 'Special Instruction'
            });
            var blankspi = form.addField({
                id: 'bspi',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'spi'
            });
            var reln = form.addSubtab({
                id: 'reln',
                label: 'Relationship'
            });
            var blankreln = form.addField({
                id: 'brel',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'reln'
            });
            var comn = form.addSubtab({
                id: 'comn',
                label: 'Communication'
            });
            var bcomn = form.addField({
                id: 'bcomn',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'comn'
            });
            var tax = form.addSubtab({
                id: 'tax',
                label: 'Tax Reporting'
            });
            var blanktax = form.addField({
                id: 'btax',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'tax'
            });
            var wms = form.addSubtab({
                id: 'wms',
                label: 'WMS'
            });
            var blankwms = form.addField({
                id: 'bwms',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'wms'
            });
            var pacejet = form.addSubtab({
                id: 'pacejet',
                label: 'Pacejet'
            });
            var blankp = form.addField({
                id: 'blp',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'pacejet'
            });
            var applist = form.addSubtab({
                id: 'applist',
                label: 'Approval List'
            });
            var blankreln = form.addField({
                id: 'bapl',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'applist'
            });
            var ins = form.addSubtab({
                id: 'ins',
                label: 'Inspection'
            });
            var blankins = form.addField({
                id: 'bins',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'ins'
            });
            var cust = form.addSubtab({
                id: 'cust',
                label: 'Custom'
            });
            var blankcust = form.addField({
                id: 'bcust',
                type: serverWidget_1.default.FieldType.TEXT,
                label: 'blank',
                container: 'cust'
            });
            /*
            //SUMMARY
                    const summaryHtml = `
            <table>
            <tr><td><b>Purchased Amount:</b></td><td>0.00</td></tr>
            <tr><td><b>Received Amount:</b></td><td>0.00</td></tr>
            <tr><td><b>Billed Amount:</b></td><td>0.00</td></tr>
            </table>`;
                    form.addField({
                        id: 'custpage_summary',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Summary'
                    });*/
            /*
            
            
                                select.addSelectOption({
                                    value: 'a',
                                    text: 'BL'
                                });
            
                                select.addSelectOption({
                                    value: 'b',
                                    text: 'AL'
                                });
                                const field = form.addField({
                                    id: 'order_no',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Order Number'
                                });
                                const st = form.addField({
                                    id: 'start_',
                                    type: serverWidget.FieldType.DATE,
                                    label: 'Start Date'
                                });
                                const end = form.addField({
                                    id: 'end_',
                                    type: serverWidget.FieldType.DATE,
                                    label: 'End Date'
                                });
                                const status = form.addField({
                                    id: 'status_',
                                    type: serverWidget.FieldType.SELECT,
                                    label: 'Status'
                                });
                                status.addSelectOption({
                                    value: 'a',
                                    text: 'Pending'
                                });
                                status.addSelectOption({
                                    value: 'b',
                                    text: 'Completed'
                                });
            
            
            
                                field.updateBreakType({
                                    breakType: serverWidget.FieldBreakType.STARTCOL
                                });
            
            
            
            
            
                                const sublist = form.addSublist({
                                    id: 'sublist_',
                                    type: serverWidget.SublistType.INLINEEDITOR,
                                    label: 'Order Details'
                                });
                                sublist.addField({
                                    id: 'inven',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Inventory ID'
                                });
                                sublist.addField({
                                    id: 'itname',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Item Name'
                                });
            
                        sublist.addField({
                                    id: 'qn',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Quantity'
                                });
                                sublist.addField({
                                    id: 'qty',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'QON'
                                });
                                sublist.addField({
                                    id: 'boq',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'BOQ'
                                });/*
                                sublist.addField({
                                    id: 'Sc_date',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Scheduled Date'
                                });
                                sublist.addField({
                                    id: 'rel_date',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Release Date'
                                });
                        /*
            
                                sublist.addField({
                                    id: 'boq',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Blanket Open Quantity'
                                });
                                sublist.addField({
                                    id: 'Sc_date',
                                    type: serverWidget.FieldType.DATE,
                                    label: 'Scheduled Date'
                                });
                                sublist.addField({
                                    id: 'rel_date',
                                    type: serverWidget.FieldType.TEXT,
                                    label: 'Release Date'
                                });
            
            
            
                            form.addSubmitButton({
                                label: 'Submit Button'
                            });*/
            context.response.writePage(form);
        }
        else {
            const delimiter = /\u0001/;
            const textField = context.request.parameters.custpage_text;
            const dateField = context.request.parameters.custpage_date;
            const currencyField = context.request.parameters.custpage_currencyfield;
            const selectField = context.request.parameters.custpage_selectfield;
            const sublistData = context.request.parameters.sublistdata.split(delimiter);
            const sublistField1 = sublistData[0];
            const sublistField2 = sublistData[1];
            context.response.write('You have entered: ' + textField + ' ' + dateField + ' '
                + currencyField + ' ' + selectField + ' ' + sublistField1 + ' ' + sublistField2);
        }
    }
    return {
        onRequest: onRequest
    };
});

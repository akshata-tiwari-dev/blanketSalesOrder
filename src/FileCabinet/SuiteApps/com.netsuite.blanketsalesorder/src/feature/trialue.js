/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
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
define(["require", "exports", "N/search", "N/ui/serverWidget", "N/log"], function (require, exports, search, ui, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    search = __importStar(search);
    ui = __importStar(ui);
    log = __importStar(log);
    const beforeLoad = (context) => {
        if (context.type !== context.UserEventType.VIEW)
            return;
        try {
            const form = context.form;
            const record = context.newRecord;
            const linkCode = record.getValue('custrecord_item_sched_code');
            if (!linkCode) {
                log.debug('Link Code not found', 'custrecord_item_sched_code is empty');
                return;
            }
            // Add new tab
            form.addTab({
                id: 'custpage_schedule_tab',
                label: 'Linked Schedule Records'
            });
            // Add sublist under that tab
            const sublist = form.addSublist({
                id: 'custpage_schedule_sublist',
                label: 'Schedules',
                type: ui.SublistType.LIST,
                tab: 'custpage_schedule_tab'
            });
            sublist.addField({
                id: 'sched_name',
                label: 'Name',
                type: ui.FieldType.TEXT
            });
            sublist.addField({
                id: 'sched_date',
                label: 'Schedule Date',
                type: ui.FieldType.DATE
            });
            sublist.addField({
                id: 'sched_qty',
                label: 'Quantity',
                type: ui.FieldType.INTEGER
            });
            // Search for matching schedule records
            const results = search.create({
                type: 'customrecord208',
                filters: [['custrecord_sched_sched_code', 'is', linkCode]],
                columns: ['name', 'custrecordstdate', 'custrecordqtyy']
            }).run().getRange({ start: 0, end: 100 });
            for (let i = 0; i < results.length; i++) {
                const res = results[i];
                sublist.setSublistValue({
                    id: 'sched_name',
                    line: i,
                    value: (res.getValue({ name: 'name' }) || '')
                });
                const schedDate = res.getValue({ name: 'custrecordstdate' });
                if (schedDate) {
                    sublist.setSublistValue({
                        id: 'sched_date',
                        line: i,
                        value: schedDate
                    });
                }
                const qty = res.getValue({ name: 'custrecordqtyy' });
                if (qty) {
                    sublist.setSublistValue({
                        id: 'sched_qty',
                        line: i,
                        value: qty.toString()
                    });
                }
            }
        }
        catch (e) {
            log.error({
                title: 'Error in Linked Schedule Sublist',
                details: e.message || JSON.stringify(e)
            });
        }
    };
    exports.beforeLoad = beforeLoad;
});

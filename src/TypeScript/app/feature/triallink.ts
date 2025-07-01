/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as search from 'N/search';
import * as ui from 'N/ui/serverWidget';
import * as log from 'N/log';

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (context) => {
    if (context.type !== context.UserEventType.VIEW) return;

    try {
        const form = context.form;
        const record = context.newRecord;
        const linkCode = record.getValue('custrecord_itemid') ;

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
            label: 'Release Date',
            type: ui.FieldType.DATE
        });

        sublist.addField({
            id: 'sched_qty',
            label: 'Quantity',
            type: ui.FieldType.INTEGER
        });

        // Search for matching schedule records
        const results = search.create({
            type: 'customrecord_schedule',
            filters: [['custrecord_sched_sched_code', 'is', linkCode]],
            columns: ['name', 'custrecordstdate', 'custrecordqtyy']
        }).run().getRange({ start: 0, end: 100 });

        for (let i = 0; i < results.length; i++) {
            const res = results[i];

            sublist.setSublistValue({
                id: 'sched_name',
                line: i,
                value: (res.getValue({ name: 'name' }) || '') as string
            });

            const schedDate = res.getValue({ name: 'custrecordstdate' });
            if (schedDate) {
                sublist.setSublistValue({
                    id: 'sched_date',
                    line: i,
                    value: schedDate as string
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

    } catch (e: any) {
        log.error({
            title: 'Error in Linked Schedule Sublist',
            details: e.message || JSON.stringify(e)
        });
    }
};
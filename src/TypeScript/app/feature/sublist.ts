/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as url from 'N/url';
import { UserEventContext } from 'N/types';
import { EntryPoints } from 'N/types';
import * as record from 'N/record';
import * as serverWidget from 'N/ui/serverWidget';
import * as search from 'N/search';
export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (context: UserEventContext) => {
    if (context.type !== context.UserEventType.VIEW) return;
    const form = context.form;
    // Add a Subtab (optional)
    form.addTab({
        id: 'custpage_custom_tab',
        label: 'Custom Sublist'
    });
    // Add a Sublist (Inline Editor, List, or Staticlist)
    const sublist = form.addSublist({
        id: 'custpage_custom_sublist',
        label: 'Related Data',
        type: serverWidget.SublistType.LIST,
        tab: 'custpage_custom_tab'
    });
    // Add Fields to the Sublist
    sublist.addField({
        id: 'custpage_col_id',
        label: 'Internal ID',
        type: serverWidget.FieldType.TEXT
    });
    sublist.addField({
        id: 'custpage_col_name',
        label: 'Name',
        type: serverWidget.FieldType.TEXT
    });
    // Example: Populate Sublist with Related Records (using a saved search or custom logic)
    const exampleSearch = search.create({
        type: 'customer',
        filters: [['email', 'isnotempty', '']],
        columns: ['internalid', 'entityid'],
    });
    const results = exampleSearch.run().getRange({ start: 0, end: 10 });
    results?.forEach((result, index) => {
        sublist.setSublistValue({
            id: 'custpage_col_id',
            line: index,
            value: result.getValue({ name: 'internalid' })?.toString() || ''
        });
        sublist.setSublistValue({
            id: 'custpage_col_name',
            line: index,
            value: result.getValue({ name: 'entityid' }) as string
        });
    });
};



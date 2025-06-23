/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as url from 'N/url';
import { UserEventContext } from 'N/types';
import { EntryPoints } from 'N/types';
import * as record from 'N/record';

import * as search from 'N/search';
export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (context: UserEventContext) => {
    //if (context.type !== context.UserEventType.VIEW) return;
   const form = context.form;
   /* form.addButton({
        id: 'custpage_auto_generate1',
        label: 'Auto Gen',
        functionName: 'autoGenerateSchedule()'
    });
    const sublist = form.addSublist({
        id: 'custpage_schedule_sublist',
        label: 'Schedule',
        type: serverWidget.SublistType.INLINEEDITOR
    });
    sublist.addField({
        id: 'custpage_release_date',
        label: 'Release Date',
        type: serverWidget.FieldType.DATE
    });
    sublist.addField({
        id: 'custpage_release_qty',
        label: 'Quantity',
        type: serverWidget.FieldType.INTEGER
    });*/
    // Client Script
    //form.clientScriptModulePath = './stsutogen.js';
};



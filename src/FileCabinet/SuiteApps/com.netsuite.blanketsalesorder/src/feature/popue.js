/*
import * as url from 'N/url';
import { UserEventContext } from 'N/types';
import * as currentRecord from 'N/currentRecord';
import * as record from 'N/record';
import { EntryPoints } from 'N/types';
import * as url from 'N/url';

import * as runtime from 'N/runtime';
import * as ui from 'N/ui/serverWidget';
import * as search from 'N/search';
export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (context: UserEventContext) => {
    if (context.type !== context.UserEventType.VIEW) return;


    const rec = currentRecord.get();
    const field=rec.getField({fieldId:'custrecord34'});
    var surl=url.resolveScript({
        scriptId:'customscripttt',
        deploymentId:'customdeploy1'
    });
    field.setValue({
        help:`<a href="${surl} target="_blank">click</a>`
    });
   /* const penIconHtml = `
        <a href="${surl}" target="_blank" title="Edit Schedule">
            ✎
        </a>
    `;
    const scheduleField = form.getField({
        id: 'custrecord34' // :point_left: Your target field ID
    });
    if (scheduleField) {
        scheduleField.updateDisplayType({displayType: ui.FieldDisplayType.INLINE});
        scheduleField.defaultValue = (rec.getValue('custrecord34') || '').toString();
        scheduleField.updateLayoutType({layoutType: ui.FieldLayoutType.NORMAL});
        scheduleField.updateBreakType({breakType: ui.FieldBreakType.STARTCOL});
        // :point_down: Add Pen icon to its help text or description
        scheduleField.setHelpText({
            help: `Click here to edit schedule ${penIconHtml}`
        });
    }

};

*/

/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as url from 'N/url';
import { UserEventContext } from 'N/types';
import * as serverWidget from 'N/ui/serverWidget';
export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (context: UserEventContext) => {
    /*const form = context.form;
    const surl: string = url.resolveScript({
        scriptId: 'customscript2721',
        deploymentId: 'customdeploy1'
    });
    /*form.addButton({
        id: 'custpage_suiteletbutton1',
        label: 'generate schedule',

        //functionName: `(function() { window.location = "${surl}" })();
        functionName: `(function() { window.open( )();`
    });
    form.addButton({
        id: 'custpage_suiteletbutton1',
        label: 'Generate Schedule',
        functionName: `(function() {
            window.open(
                '${surl}',
                'GenerateSchedulePopup',
                'width=700,height=600,resizable=yes,scrollbars=yes'
            );
        })();`
    });
    var purl='https://th.bing.com/th/id/OIP.hT9n1_PJvbi8kZjlndt45QAAAA?w=129&h=192&c=7&r=0&o=7&pid=1.7&rm=3';
    var tabid='Items';
    const f = form.addField({
        id: 'custpage_pen_icon_field',
        type: serverWidget.FieldType.INLINEHTML,
        label: ' ',
        container: tabid
    });
  f.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE });
    f.defaultValue = `
        <a href="#" onclick="nlExtOpenWindow('{$surl}', 'Pop up title', 1000, 500)">
            <img src="${purl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule">
        </a>
    `;*/
    const form = context.form;

    const popupUrl = '/app/site/hosting/scriptlet.nl?script=2821&deploy=1';
    const imgUrl = 'https://th.bing.com/th/id/OIP.Yo772HA_MHwoOdBDDiqeOQHaJ4?w=144&h=192&c=7&r=0&o=7&pid=1.7&rm=3';

    const html = `
        <a href="#" onclick="nlExtOpenWindow('${popupUrl}', 'Edit Schedule', 800, 600)">
            <img src="${imgUrl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule" />
        </a>
    `;
/*
    const field = form.addField({
        id: 'custpage_edit_schedule_html',
        type: serverWidget.FieldType.INLINEHTML,
        label: 'Edit Schedule',
        container:tabid
    });*/
    var field = record.getField({ fieldId: 'custrecord38' });

    field.defaultValue = html;
};

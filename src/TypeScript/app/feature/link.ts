/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types';
import * as url from 'N/url';
import { UserEventContext } from 'N/types';
export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (context: UserEventContext) => {
    const form = context.form;
    const surl: string = url.resolveScript({
        scriptId: 'customscriptschhh',
        deploymentId: 'customdeploy2'
    });
    form.addButton({
        id: 'custpage_suiteletbutton1',
        label: 'generate schedule',
        functionName: `(function() { window.location = "${surl}" })();`
    });
};
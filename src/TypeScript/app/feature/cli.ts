/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import * as ui from 'N/ui/message';
import * as currentRecord from 'N/currentRecord';
import * as format from 'N/format';
import * as serverWidget from 'N/ui/serverWidget';
export function pageInit(context: any) {
    var record = currentRecord.get();
    var field = record.getField({ fieldId: 'custrecord34' });
    const popupUrl = '/app/site/hosting/scriptlet.nl?script=2821&deploy=1';
    const imgUrl = 'https://th.bing.com/th/id/OIP.Yo772HA_MHwoOdBDDiqeOQHaJ4?w=144&h=192&c=7&r=0&o=7&pid=1.7&rm=3';

    const html = `
        <a href="#" onclick="nlExtOpenWindow('${popupUrl}', 'Edit Schedule', 800, 600)">
            <img src="${imgUrl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule" />
        </a>
    `;
    field.defaultValue = html;
}

/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import { EntryPoints } from 'N/types';

import * as currentRecord from 'N/currentRecord';
declare function nlExtOpenWindow(url: string, name: string, width: number, height: number): void;

export const fieldChanged: EntryPoints.Client.fieldChanged = (context) => {

    const record = currentRecord.get();
    const itemId = context.currentRecord.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',
        fieldId: 'custrecord_itemid'
    });



    const isChecked = context.currentRecord.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',
        fieldId: 'custrecord_gensch'
    }) as boolean;
    //  const suiteletUrl = `/app/site/hosting/scriptlet.nl?script=123&deploy=1&itemid=${itemId}`;
    if (isChecked) {
        if (!itemId) {
            alert('Please save the record before creating a schedule.');
            return;
        }

        const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemId}`;
        alert(url);
        nlExtOpenWindow(
            encodeURI(url),
            'EditSchedule',
            800,
            600
        );
    }

};
/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import { ClientScript } from 'N/types';
import * as currentRecord from 'N/currentRecord';

declare function nlExtOpenWindow(url: string, name: string, width: number, height: number): void;

export const fieldChanged: ClientScript['fieldChanged'] = (context) => {
    if (context.sublistId !== 'recmachcustrecord_bso_item_sublist_link') return;

    const rec = context.currentRecord;
    const bsoid = rec.id;

    const itemId = rec.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',
        fieldId: 'custrecord_itemid'
    });





    const isChecked = rec.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',
        fieldId: 'custrecord_gensch'
    }) as boolean;

    if (isChecked && itemId) {
        const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemId}&bsoId=${bsoid}`;
        nlExtOpenWindow(encodeURI(url), 'EditSchedule', 800, 600);
    }
};

export const pageInit: ClientScript['pageInit'] = (context) => {
    const rec = currentRecord.get();

    const lineCount = rec.getLineCount({
        sublistId: 'recmachcustrecord_bso_item_sublist_link'
    });

    for (let i = 0; i < lineCount; i++) {
        const isChecked = rec.getSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_gensch',
            line: i
        }) as boolean;

        if (isChecked) {
            const itemId = rec.getSublistValue({
                sublistId: 'recmachcustrecord_bso_item_sublist_link',
                fieldId: 'custrecord_itemid',
                line: i
            });

            const bsoId = rec.id;
            const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemId}&bsoId=${bsoId}`;
            nlExtOpenWindow(encodeURI(url), 'EditSchedule', 800, 600);
            break; // only open once
        }
    }
};







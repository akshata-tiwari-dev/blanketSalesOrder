/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import { ClientScript } from 'N/types';
import * as currentRecord from 'N/currentRecord';

//Function to open a popup
declare function nlExtOpenWindow(url: string, name: string, width: number, height: number): void;

//open popup on checking  the box while editing (Dynamic Interaction)

export const fieldChanged: ClientScript['fieldChanged'] = (context) => {
    if (context.sublistId !== 'recmachcustrecord_bso_item_sublist_link') return;

    const rec = context.currentRecord;//access the current record i:e bso
    const bsoid = rec.id;//id of bsorecord

    const itemLineId = rec.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',
        fieldId: 'custrecord_itemid'
    });





    const isCheckedScheduleBox = rec.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',
        fieldId: 'custrecord_gensch'
    }) as boolean;

    if (isCheckedScheduleBox && itemLineId) {
        const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemLineId}&bsoId=${bsoid}`;
        nlExtOpenWindow(encodeURI(url), 'Schedule Creation', 1000, 800);
    }
};

/*
//open popup after load operation
export const pageInit: ClientScript['pageInit'] = (context) => {
    const recordIdOfBSO = currentRecord.get();

//number of itemlines in bso
    const noOfItemLines = recordIdOfBSO.getLineCount({
        sublistId: 'recmachcustrecord_bso_item_sublist_link'
    });
//iterate through every ItemLines
    for (let i = 0; i < noOfItemLines; i++) {
        const isChecked = recordIdOfBSO.getSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_gensch',
            line: i
        }) as boolean;

        if (isChecked) {
            const itemId = recordIdOfBSO.getSublistValue({
                sublistId: 'recmachcustrecord_bso_item_sublist_link',
                fieldId: 'custrecord_itemid',
                line: i
            });

            const bsoId = recordIdOfBSO.id;
            const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemId}&bsoId=${bsoId}`;
            nlExtOpenWindow(encodeURI(url), 'Schedule Creation', 1000, 800);
            break; // only open popup once
        }
    }
};







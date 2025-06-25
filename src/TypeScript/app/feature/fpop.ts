/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import { ClientScript } from 'N/types';
import * as currentRecord from 'N/currentRecord';
declare function nlExtOpenWindow(url: string, name: string, width: number, height: number): void;

export const fieldChanged: ClientScript['fieldChanged'] = (context) => {
    var record = currentRecord.get();

    const isChecked = context.currentRecord.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',
        fieldId: 'custrecord39'
    }) as boolean;
//flow==fpop->suitelet->stsutogen
//alert(isChecked ? 'Yes' : 'No');
        if (isChecked){

           nlExtOpenWindow(
                '/app/site/hosting/scriptlet.nl?script=3130&deploy=1',
                'EditSchedule',
                800,
                600
            );


            // Optionally reset checkbox to false
           /* context.currentRecord.setValue({
                fieldId: 'custrecord39',
                value: false
            });*/
            //alert("done");
        }


    };


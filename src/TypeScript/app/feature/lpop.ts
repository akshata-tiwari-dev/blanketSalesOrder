/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */

import { ClientScript } from 'N/types';
import * as currentRecord from 'N/currentRecord';
declare function nlExtOpenWindow(url: string, name: string, width: number, height: number): void;

export const fieldChanged: ClientScript['fieldChanged'] = (context) => {
    var record = currentRecord.get();

    const itemsl = context.currentRecord.getCurrentSublistValue({
        sublistId: 'recmachcustrecord_bso_item_sublist_link',

    });
    const sch=itemsl.getCurrentSublistValue({
        sublistId: 'recmachcustrecord34',

    });

//flow==fpop->suitelet->stsutogen
//alert(isChecked ? 'Yes' : 'No');



        // Optionally reset checkbox to false
        /* context.currentRecord.setValue({
             fieldId: 'custrecord39',
             value: false
         });*/
        //alert("done");
    }


};


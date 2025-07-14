/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fieldChanged = void 0;
    /**
     * fieldChanged - Triggered when a field changes in the BSO sublist
     * Opens a popup window if the checkbox is selected
     *
     * @param context - FieldChangedContext containing record and sublist information
     */
    const fieldChanged = (context) => {
        if (context.sublistId !== 'recmachcustrecord_bso_item_sublist_link')
            return;
        const rec = context.currentRecord; // Current BSO record
        const bsoId = rec.id; // BSO internal ID
        const itemLineId = rec.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_itemid'
        });
        const isCheckedScheduleBox = rec.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_gensch'
        });
        if (isCheckedScheduleBox && itemLineId) {
            const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemLineId}&bsoId=${bsoId}`;
            nlExtOpenWindow(encodeURI(url), 'Schedule Creation', 1000, 800);
        }
    };
    exports.fieldChanged = fieldChanged;
});
/**
 * Uncommented this section to open popup on page load based on checked checkbox in any sublist line
 */
/*
export const pageInit: ClientScript['pageInit'] = (context) => {
    const record = currentRecord.get(); // Current BSO record instance

    const noOfItemLines = record.getLineCount({
        sublistId: 'recmachcustrecord_bso_item_sublist_link'
    });

    for (let i = 0; i < noOfItemLines; i++) {
        const isChecked = record.getSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId:  'custrecord_gensch',
            line:     i
        }) as boolean;

        if (isChecked) {
            const itemId = record.getSublistValue({
                sublistId: 'recmachcustrecord_bso_item_sublist_link',
                fieldId:  'custrecord_itemid',
                line:     i
            });

            const bsoId = record.id;
            const url   = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemId}&bsoId=${bsoId}`;
            nlExtOpenWindow(encodeURI(url), 'Schedule Creation', 1000, 800);
            break; // Only open popup once
        }
    }
};
*/ 

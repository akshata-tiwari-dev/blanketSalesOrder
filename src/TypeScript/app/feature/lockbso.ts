/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

import * as serverWidget from 'N/ui/serverWidget';
import * as log from 'N/log';
function beforeLoad(context: {
    type: string;
    form: serverWidget.Form;
    newRecord: any;
    request?: any;
}) {
    if (context.type === 'edit' || context.type === 'view') {
        const form = context.form;
        const rec = context.newRecord;

        const status = rec.getValue({ fieldId: 'custrecord127' });

        if (status == 1 || status == 3) {
            const fieldIds = [
                'custrecord_customer',
                'custrecord_memo',
                'custrecord_project',
                'custrecord_loc',
                'custrecordnotify',
                'custrecord127'
            ];

            fieldIds.forEach(function (fieldId) {
                const field = form.getField({ id: fieldId });
                if (field) {
                    field.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                }
            });

            const sublistId = 'recmachcustrecord_bso_item_sublist_link';
            try {
                var sublist = form.getSublist({ id: sublistId });
                if (!sublist) {
                    log.debug('Sublist not found', sublistId);
                } else {
                    var sublistFieldIds = ['custrecord_itemid', 'custrecord_rate', 'custrecord_gensch'];
                    var checkboxFields = ['custrecord_gensch'];

                    for (var j = 0; j < sublistFieldIds.length; j++) {
                        var subFieldId = sublistFieldIds[j];
                        var subField = sublist.getField({ id: subFieldId });

                        if (subField) {
                            var displayType = checkboxFields.indexOf(subFieldId) !== -1
                                ? serverWidget.FieldDisplayType.NORMAL
                                : serverWidget.FieldDisplayType.DISABLED;

                            subField.updateDisplayType({
                                displayType: displayType
                            });
                        } else {
                            log.debug('Sublist field not found', subFieldId);
                        }
                    }
                }
            } catch (e) {
                log.error('Error while accessing sublist', e);
            }

            try {
                form.removeButton({ id: 'submit' });
            } catch (e) {
                // Silent fail
            }
        }
    }
}

export = {
    beforeLoad:beforeLoad
};

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

/**
 * Author - Ashutosh Mohanty
 */

import * as serverWidget from 'N/ui/serverWidget';
import * as log from 'N/log';

/**
 * beforeLoad - Disables fields and sublist if status is submitted/approved
 *
 * @param context.type        - Event type (create/edit/view)
 * @param context.form        - Form object to modify
 * @param context.newRecord   - Current record
 */
function beforeLoad(context: {
    type: string;
    form: serverWidget.Form;
    newRecord: any;
    request?: any;
}) {
    if (context.type === 'edit' || context.type === 'view') {
        const form = context.form;
        const rec  = context.newRecord;

        const status = rec.getValue({ fieldId: 'custrecord127' });

        // Disable fields if status is 1 (Submitted) or 3 (Approved)
        if (status == 1 || status == 3) {
            const fieldIds = [
                'custrecord_customer',
                'custrecord_memo',
                'custrecord_project',
                'custrecord_loc',
                'custrecordnotify',
                'custrecord127'
            ];

            fieldIds.forEach((fieldId) => {
                const field = form.getField({ id: fieldId });
                if (field) {
                    field.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                }
            });

            const sublistId = 'recmachcustrecord_bso_item_sublist_link';

            try {
                const sublist = form.getSublist({ id: sublistId });

                if (!sublist) {
                    log.debug('Sublist not found', sublistId);
                } else {
                    const sublistFieldIds = ['custrecord_itemid', 'custrecord_rate', 'custrecord_gensch'];
                    const checkboxFields  = ['custrecord_gensch'];

                    for (let j = 0; j < sublistFieldIds.length; j++) {
                        const subFieldId = sublistFieldIds[j];
                        const subField   = sublist.getField({ id: subFieldId });

                        if (subField) {
                            const displayType = checkboxFields.includes(subFieldId)
                                ? serverWidget.FieldDisplayType.NORMAL
                                : serverWidget.FieldDisplayType.DISABLED;

                            subField.updateDisplayType({ displayType });
                        } else {
                            log.debug('Sublist field not found', subFieldId);
                        }
                    }
                }
            } catch (e) {
                log.error('Error while accessing sublist', e);
            }

            // Remove Submit button to prevent accidental edits
            try {
                form.removeButton({ id: 'submit' });
            } catch (e) {
                // button might not exist in all contexts
            }
        }
    }
}

export = {
    beforeLoad: beforeLoad
};
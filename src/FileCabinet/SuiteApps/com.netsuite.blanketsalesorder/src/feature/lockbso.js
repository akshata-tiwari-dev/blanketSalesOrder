/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define(["require", "exports", "N/ui/serverWidget", "N/log"], function (require, exports, serverWidget, log) {
    "use strict";
    serverWidget = __importStar(serverWidget);
    log = __importStar(log);
    function beforeLoad(context) {
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
                    }
                    else {
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
                            }
                            else {
                                log.debug('Sublist field not found', subFieldId);
                            }
                        }
                    }
                }
                catch (e) {
                    log.error('Error while accessing sublist', e);
                }
                try {
                    form.removeButton({ id: 'submit' });
                }
                catch (e) {
                    // Silent fail
                }
            }
        }
    }
    return {
        beforeLoad: beforeLoad
    };
});

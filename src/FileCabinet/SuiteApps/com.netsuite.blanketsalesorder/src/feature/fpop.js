/**
 * @NAPIVersion 2.1
 * @NScriptType ClientScript
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
define(["require", "exports", "N/currentRecord"], function (require, exports, currentRecord) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pageInit = exports.fieldChanged = void 0;
    currentRecord = __importStar(currentRecord);
    const fieldChanged = (context) => {
        if (context.sublistId !== 'recmachcustrecord_bso_item_sublist_link')
            return;
        const rec = context.currentRecord;
        const bsoid = rec.id;
        const itemId = rec.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_itemid'
        });
        const isChecked = rec.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_gensch'
        });
        if (isChecked && itemId) {
            const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemId}&bsoId=${bsoid}`;
            nlExtOpenWindow(encodeURI(url), 'EditSchedule', 800, 600);
        }
    };
    exports.fieldChanged = fieldChanged;
    const pageInit = (context) => {
        const rec = currentRecord.get();
        const lineCount = rec.getLineCount({
            sublistId: 'recmachcustrecord_bso_item_sublist_link'
        });
        for (let i = 0; i < lineCount; i++) {
            const isChecked = rec.getSublistValue({
                sublistId: 'recmachcustrecord_bso_item_sublist_link',
                fieldId: 'custrecord_gensch',
                line: i
            });
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
    exports.pageInit = pageInit;
});

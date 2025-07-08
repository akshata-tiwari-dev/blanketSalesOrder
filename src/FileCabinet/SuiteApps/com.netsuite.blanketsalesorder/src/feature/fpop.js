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
    //open popup on checking  the box while editing (Dynamic Interaction)
    const fieldChanged = (context) => {
        if (context.sublistId !== 'recmachcustrecord_bso_item_sublist_link')
            return;
        const rec = context.currentRecord; //access the current record i:e bso
        const bsoid = rec.id; //id of bsorecord
        const itemLineId = rec.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_itemid'
        });
        const isCheckedScheduleBox = rec.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord_gensch'
        });
        if (isCheckedScheduleBox && itemLineId) {
            const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemLineId}&bsoId=${bsoid}`;
            nlExtOpenWindow(encodeURI(url), 'Schedule Creation', 800, 600);
        }
    };
    exports.fieldChanged = fieldChanged;
    //open popup after load operation
    const pageInit = (context) => {
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
            });
            if (isChecked) {
                const itemId = recordIdOfBSO.getSublistValue({
                    sublistId: 'recmachcustrecord_bso_item_sublist_link',
                    fieldId: 'custrecord_itemid',
                    line: i
                });
                const bsoId = recordIdOfBSO.id;
                const url = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=${itemId}&bsoId=${bsoId}`;
                nlExtOpenWindow(encodeURI(url), 'Schedule Creation', 800, 600);
                break; // only open popup once
            }
        }
    };
    exports.pageInit = pageInit;
});

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
    exports.fieldChanged = void 0;
    currentRecord = __importStar(currentRecord);
    const fieldChanged = (context) => {
        const record = currentRecord.get();
        const itemId = context.currentRecord.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord23'
        });
        const isChecked = context.currentRecord.getCurrentSublistValue({
            sublistId: 'recmachcustrecord_bso_item_sublist_link',
            fieldId: 'custrecord39'
        });
        //  const suiteletUrl = `/app/site/hosting/scriptlet.nl?script=123&deploy=1&itemid=${itemId}`;
        if (isChecked) {
            if (!itemId) {
                alert('Please save the record before creating a schedule.');
                return;
            }
            const url = `/app/site/hosting/scriptlet.nl?script=3523&deploy=1&itemid=${itemId}`;
            alert(url);
            nlExtOpenWindow(encodeURI(url), 'EditSchedule', 800, 600);
        }
    };
    exports.fieldChanged = fieldChanged;
});

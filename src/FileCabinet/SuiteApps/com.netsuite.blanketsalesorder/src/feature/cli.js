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
    exports.pageInit = void 0;
    currentRecord = __importStar(currentRecord);
    function pageInit(context) {
        var record = currentRecord.get();
        var field = record.getField({ fieldId: 'custrecord34' });
        const popupUrl = '/app/site/hosting/scriptlet.nl?script=2821&deploy=1';
        const imgUrl = 'https://th.bing.com/th/id/OIP.Yo772HA_MHwoOdBDDiqeOQHaJ4?w=144&h=192&c=7&r=0&o=7&pid=1.7&rm=3';
        const html = `
        <a href="#" onclick="nlExtOpenWindow('${popupUrl}', 'Edit Schedule', 800, 600)">
            <img src="${imgUrl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule" />
        </a>
    `;
        field.defaultValue = html;
    }
    exports.pageInit = pageInit;
});

/**
 * @NApiVersion 2.1
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
define(["require", "exports", "N/https"], function (require, exports, https) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.triggerMapReduce = exports.pageInit = void 0;
    https = __importStar(https);
    /**
     * Called when page loads — also makes triggerMapReduce globally available.
     */
    function pageInit(context) {
        window.triggerMapReduce = triggerMapReduce;
    }
    exports.pageInit = pageInit;
    /**
     * Actual function triggered from the Suitelet's button.
     */
    function triggerMapReduce() {
        const scriptId = 'customscript161'; // Your Suitelet Script ID
        const deploymentId = 'customdeploy1'; // Your Suitelet Deployment ID
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/app/site/hosting/scriptlet.nl?script=${scriptId}&deploy=${deploymentId}&action=runmr`;
        https.get.promise({ url })
            .then(response => {
            alert('Sales Order generation started. Please refresh the page to see the results.');
            location.reload();
        })
            .catch(error => {
            alert(`Error triggering Map/Reduce: ${error.message}`);
        });
    }
    exports.triggerMapReduce = triggerMapReduce;
});

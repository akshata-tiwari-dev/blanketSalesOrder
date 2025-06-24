/**
 * @NAPIVersion 2.1
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
define(["require", "exports", "N/url", "N/ui/serverWidget"], function (require, exports, url, serverWidget) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    url = __importStar(url);
    serverWidget = __importStar(serverWidget);
    const beforeLoad = (context) => {
        const form = context.form;
        const surl = url.resolveScript({
            scriptId: 'customscript2521',
            deploymentId: 'customdeploy1'
        });
        /*form.addButton({
            id: 'custpage_suiteletbutton1',
            label: 'generate schedule',
    
            //functionName: `(function() { window.location = "${surl}" })();
            functionName: `(function() { window.open( )();`
        });
        form.addButton({
            id: 'custpage_suiteletbutton1',
            label: 'Generate Schedule',
            functionName: `(function() {
                window.open(
                    '${surl}',
                    'GenerateSchedulePopup',
                    'width=700,height=600,resizable=yes,scrollbars=yes'
                );
            })();`
        });*/
        var purl = 'https://th.bing.com/th/id/OIP.hT9n1_PJvbi8kZjlndt45QAAAA?w=129&h=192&c=7&r=0&o=7&pid=1.7&rm=3';
        var tabid = 'Items';
        const f = form.addField({
            id: 'custpage_pen_icon_field',
            type: serverWidget.FieldType.INLINEHTML,
            label: ' ',
            container: tabid
        });
        f.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE });
        f.defaultValue = `
        <a href="#" onclick="window.open('${surl}', 'penPopup', 'width=700,height=500,scrollbars=yes'); return false;">
            <img src="${purl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule">
        </a>
    `;
    };
    exports.beforeLoad = beforeLoad;
});

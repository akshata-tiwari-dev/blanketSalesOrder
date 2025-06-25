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
define(["require", "exports", "N/ui/serverWidget"], function (require, exports, serverWidget) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    serverWidget = __importStar(serverWidget);
    const beforeLoad = (context) => {
        /*const form = context.form;
        const surl: string = url.resolveScript({
            scriptId: 'customscript2721',
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
        });
        var purl='https://th.bing.com/th/id/OIP.hT9n1_PJvbi8kZjlndt45QAAAA?w=129&h=192&c=7&r=0&o=7&pid=1.7&rm=3';
        var tabid='Items';
        const f = form.addField({
            id: 'custpage_pen_icon_field',
            type: serverWidget.FieldType.INLINEHTML,
            label: ' ',
            container: tabid
        });
      f.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE });
        f.defaultValue = `
            <a href="#" onclick="nlExtOpenWindow('{$surl}', 'Pop up title', 1000, 500)">
                <img src="${purl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule">
            </a>
        `;*/
        const form = context.form;
        const popupUrl = '/app/site/hosting/scriptlet.nl?script=2821&deploy=1';
        const imgUrl = 'https://th.bing.com/th/id/OIP.Yo772HA_MHwoOdBDDiqeOQHaJ4?w=144&h=192&c=7&r=0&o=7&pid=1.7&rm=3';
        const html = `
        <a href="#" onclick="nlExtOpenWindow('${popupUrl}', 'Edit Schedule', 800, 600)">
            <img src="${imgUrl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule" />
        </a>
    `;
        var field = form.getField({ id: 'custrecord38' });
        const field = form.addField({
            id: 'custpage_edit_schedule_html',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Edit Schedule',
        });
        field.defaultValue = html;
    };
    exports.beforeLoad = beforeLoad;
});

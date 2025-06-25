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
        if (context.type !== context.UserEventType.VIEW)
            return;
        const form = context.form;
        const sublistId = 'recmach_custrecord37';
        const fieldId = 'custrecord33';
        const prefixedFieldId = `recmach_${fieldId}`;
        const sublist = form.getSublist({ id: sublistId });
        sublist.addField({
            id: prefixedFieldId,
            label: 'Edit Schedule',
            type: serverWidget.FieldType.INLINEHTML
        });
        const popupUrl = '/app/site/hosting/scriptlet.nl?script=2821&deploy=1';
        const imgUrl = 'https://th.bing.com/th/id/OIP.Yo772HA_MHwoOdBDDiqeOQHaJ4?w=144&h=192&c=7&r=0&o=7&pid=1.7&rm=3';
        sublist.getField({ id: prefixedFieldId }).defaultValue = `
        <a href="#" onclick="nlExtOpenWindow('${popupUrl}', 'Edit Schedule', 800, 600)">
            <img src="${imgUrl}" style="width:16px;height:16px;cursor:pointer;" title="Edit Schedule" />
        </a>
    `;
    };
    exports.beforeLoad = beforeLoad;
});

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
define(["require", "exports", "N/ui/serverWidget", "N/search"], function (require, exports, serverWidget, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    serverWidget = __importStar(serverWidget);
    search = __importStar(search);
    const beforeLoad = (context) => {
        if (context.type !== context.UserEventType.VIEW)
            return;
        const form = context.form;
        // Add a Subtab (optional)
        form.addTab({
            id: 'custpage_custom_tab',
            label: 'Custom Sublist'
        });
        // Add a Sublist (Inline Editor, List, or Staticlist)
        const sublist = form.addSublist({
            id: 'custpage_custom_sublist',
            label: 'Related Data',
            type: serverWidget.SublistType.LIST,
            tab: 'custpage_custom_tab'
        });
        // Add Fields to the Sublist
        sublist.addField({
            id: 'custpage_col_id',
            label: 'Internal ID',
            type: serverWidget.FieldType.TEXT
        });
        sublist.addField({
            id: 'custpage_col_name',
            label: 'Name',
            type: serverWidget.FieldType.TEXT
        });
        // Example: Populate Sublist with Related Records (using a saved search or custom logic)
        const exampleSearch = search.create({
            type: 'customer',
            filters: [['email', 'isnotempty', '']],
            columns: ['internalid', 'entityid'],
        });
        const results = exampleSearch.run().getRange({ start: 0, end: 10 });
        results?.forEach((result, index) => {
            sublist.setSublistValue({
                id: 'custpage_col_id',
                line: index,
                value: result.getValue({ name: 'internalid' })?.toString() || ''
            });
            sublist.setSublistValue({
                id: 'custpage_col_name',
                line: index,
                value: result.getValue({ name: 'entityid' })
            });
        });
    };
    exports.beforeLoad = beforeLoad;
});

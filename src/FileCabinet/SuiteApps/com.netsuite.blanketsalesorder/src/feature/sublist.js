/**
 * @NAPIVersion 2.1
 * @NScriptType UserEventScript
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    const beforeLoad = (context) => {
        //if (context.type !== context.UserEventType.VIEW) return;
        const form = context.form;
        /* form.addButton({
             id: 'custpage_auto_generate1',
             label: 'Auto Gen',
             functionName: 'autoGenerateSchedule()'
         });
         const sublist = form.addSublist({
             id: 'custpage_schedule_sublist',
             label: 'Schedule',
             type: serverWidget.SublistType.INLINEEDITOR
         });
         sublist.addField({
             id: 'custpage_release_date',
             label: 'Release Date',
             type: serverWidget.FieldType.DATE
         });
         sublist.addField({
             id: 'custpage_release_qty',
             label: 'Quantity',
             type: serverWidget.FieldType.INTEGER
         });*/
        // Client Script
        //form.clientScriptModulePath = './stsutogen.js';
    };
    exports.beforeLoad = beforeLoad;
});

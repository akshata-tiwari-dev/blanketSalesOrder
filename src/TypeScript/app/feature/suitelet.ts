/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

import serverWidget from 'N/ui/serverWidget';
import * as record from 'N/record';
import * as log from 'N/log';
import { EntryPoints } from 'N/types';
import * as format from 'N/format';

function onRequest(context: EntryPoints.Suitelet.onRequestContext) {
    const request = context.request;
    const response = context.response;

    if (request.method === 'GET') {
        const form = serverWidget.createForm({ title: 'Schedule Generator' });

        form.addField({
            id: 'custpage_start_date',
            label: 'Start Date',
            type: serverWidget.FieldType.DATE
        });
        form.addField({
            id: 'custpage_end_date',
            label: 'End Date',
            type: serverWidget.FieldType.DATE
        });
        form.addField({
            id: 'custpage_quantity',
            label: 'Quantity',
            type: serverWidget.FieldType.INTEGER
        });

        const sublist = form.addSublist({
            id: 'custpage_schedule_sublist',
            label: 'Generated Schedule',
            type: serverWidget.SublistType.INLINEEDITOR
        });

       /* sublist.addField({
            id: 'custpage_item_id',
            label: 'Item',
            type: serverWidget.FieldType.SELECT,
            source: '208'
        });*/

        sublist.addField({
            id: 'custpage_release_date',
            label: 'Release Date',
            type: serverWidget.FieldType.DATE
        });
       /* const objRecord = record.load({
            type: 'customrecord606',
            id:
            isDynamic: true
        });*/

        sublist.addField({
            id: 'custpage_release_qty',
            label: 'Quantity',
            type: serverWidget.FieldType.INTEGER
        });
       var f= form.addField({
            id: 'custpage_release_freq',
            label: 'RELEASE FREQUENCY',
            type: serverWidget.FieldType.SELECT
        });
        f.addSelectOption({
            value: 'e',
            text: 'Daily'
        });

        f.addSelectOption({
            value: 'b',
            text: 'Weekly'
        });
        f.addSelectOption({
            value: 'c',
            text: 'Bi-Weekly'
        });
        f.addSelectOption({
            value: 'a',
            text: 'Monthly'
        });

        f.addSelectOption({
            value: 'd',
            text: 'Quaterly'
        });

        f.addSelectOption({
            value: 'y',
            text: 'Yearly'
        });
        const itemId = request.parameters.itemid;

        const hiddenItemField = form.addField({
            id: 'custpage_itemid',
            label: 'Item ID',
            type: serverWidget.FieldType.TEXT
        });
        hiddenItemField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        hiddenItemField.defaultValue = itemId;

        form.addSubmitButton({ label: 'Save Schedule' });

        form.addButton({
            id: 'custpage_auto_generate',
            label: 'Auto Generate',
            functionName: 'autoGenerateSchedule'
        });

        form.clientScriptModulePath = './clientscript.js';

        response.writePage(form);
    }

    /*if (request.method === 'POST') {


            const key = 'custpage_schedule_sublist';
            const sublistItem = {
                custpage_release_date: true,
                custpage_release_qty: true
            };

            const lineCount = request.getLineCount({ group: key });
            const actual: Record<string, any> = {};
            actual[key] = [];

            let successCount = 0;
            let failureCount = 0;

            for (let i = 0; i < lineCount; i++) {
                const itemId = request.parameters.itemid;

                actual[key][i] = {};

                actual[key][i]['custpage_release_date'] = request.getSublistValue({
                    group: key,
                    name: 'custpage_release_date',
                    line: i
                });

                actual[key][i]['custpage_release_qty'] = request.getSublistValue({
                    group: key,
                    name: 'custpage_release_qty',
                    line: i
                });

                const releaseDate = actual[key][i]['custpage_release_date'];
                const releaseQty = actual[key][i]['custpage_release_qty'];

                if (!releaseDate || !releaseQty) {
                    failureCount++;
                    continue;
                }

                try {
                    const sched = record.create({
                        type: 'customrecord208',
                        isDynamic: true
                    });

                    sched.setValue({
                        fieldId: 'custrecordstdate',
                        value: format.parse({
                            value: releaseDate,
                            type: format.Type.DATE
                        })
                    });

                    sched.setValue({
                        fieldId: 'custrecordqtyy',
                        value: parseInt(releaseQty)
                    });
                    sched.setValue({
                        fieldId: 'name',
                        value: 'Generated Schedule - ' + (i + 1)
                    });

                    sched.save();
                    successCount++;
                } catch (e) {
                    failureCount++;
                    log.error({
                        title: `Error Saving Schedule - Line ${i}`,
                        details: e
                    });
                }
            }

            response.write(`Schedule creation completed.<br>Success: ${successCount}<br>Failed: ${failureCount}`);
        }*/
    if (request.method === 'POST') {
        const linkCode = request.parameters.custpage_itemid;

        const key = 'custpage_schedule_sublist';
        const lineCount = request.getLineCount({ group: key });

        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < lineCount; i++) {
            const releaseDate = request.getSublistValue({
                group: key,
                name: 'custpage_release_date',
                line: i
            });

            const releaseQty = request.getSublistValue({
                group: key,
                name: 'custpage_release_qty',
                line: i
            });

            if (!releaseDate || !releaseQty) {
                failureCount++;
                continue;
            }

            try {
                const sched = record.create({
                    type: 'customrecord_schedule',
                    isDynamic: true
                });

                sched.setValue({
                    fieldId: 'custrecordstdate',
                    value: format.parse({
                        value: releaseDate,
                        type: format.Type.DATE
                    })
                });

                sched.setValue({
                    fieldId: 'custrecordqtyy',
                    value: parseInt(releaseQty)
                });

                sched.setValue({
                    fieldId: 'custrecord_sched_sched_code',
                    value: linkCode
                });

                sched.setValue({
                    fieldId: 'name',
                    value: `Generated Schedule - ${i + 1}`
                });

                sched.save();
                successCount++;

            } catch (e: any) {
                failureCount++;
                log.error({
                    title: `Schedule creation failed (Line ${i})`,
                    details: e.message || e
                });
            }
        }

        response.write(
            `✅ Schedule creation completed.<br>` +
            `Success: ${successCount}<br>` +
            `Failed: ${failureCount}<br>` +
            `Link Code: ${linkCode}`
        );
    }



}

export = { onRequest };



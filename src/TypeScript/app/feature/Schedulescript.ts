/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

import * as query from 'N/query';
import * as log from 'N/log';
import * as task from 'N/task';
import { EntryPoints } from 'N/types';


export const execute: EntryPoints.Scheduled.execute = (context) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const checkQuery = `
            SELECT bso.id 
            FROM customrecord_schedule sch
            JOIN customrecord_item items ON sch.custrecord_schsublink = items.id
            JOIN customrecord_bso bso ON items.custrecord_bso_item_sublist_link = bso.id
            WHERE TO_CHAR(sch.custrecordstdate, 'YYYY-MM-DD') = '${today}'
              AND bso.custrecord127 = 1
            FETCH FIRST 1 ROWS ONLY
        `;

        const resultSet = query.runSuiteQL({ query: checkQuery });
        const results = resultSet.asMappedResults();

        if (results.length > 0) {
            log.audit('Approved BSO Found', 'Launching Map/Reduce Script...');

            const mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript164',
                deploymentId: 'customdeploy1'
            });

            const taskId = mrTask.submit();
            log.audit('Map/Reduce Triggered', `Task ID: ${taskId}`);
        } else {
            log.audit('No Approved BSO Found', 'Map/Reduce will not run');
        }
    } catch (e: any) {
        log.error('Scheduled Script Error', e.message);
    }
}

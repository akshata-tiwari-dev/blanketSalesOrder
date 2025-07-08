/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
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
define(["require", "exports", "N/query", "N/log", "N/task"], function (require, exports, query, log, task) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execute = void 0;
    query = __importStar(query);
    log = __importStar(log);
    task = __importStar(task);
    const execute = (context) => {
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
            }
            else {
                log.audit('No Approved BSO Found', 'Map/Reduce will not run');
            }
        }
        catch (e) {
            log.error('Scheduled Script Error', e.message);
        }
    };
    exports.execute = execute;
});

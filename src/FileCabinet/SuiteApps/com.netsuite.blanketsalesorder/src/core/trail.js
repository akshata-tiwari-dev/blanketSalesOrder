/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
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
define(["require", "exports", "N/file", "N/log"], function (require, exports, file, log) {
    "use strict";
    file = __importStar(file);
    log = __importStar(log);
    const PUNCTUATION_REGEXP = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/g;
    const MapReduceScript = {
        getInputData: () => {
            log.error({ title: "Ak in getInputData", details: "Start" });
            return "the quick brown fox \njumps over the lazy dog.".split('\n');
        },
        map: (context) => {
            log.error({ title: "Ak in map", details: context.value });
            if (!context.value)
                return;
            for (let i = 0; i < context.value.length; i++) {
                const char = context.value[i];
                if (char !== ' ' && !PUNCTUATION_REGEXP.test(char)) {
                    context.write({
                        key: char,
                        value: 1
                    });
                }
            }
        },
        reduce: (context) => {
            log.error({ title: "Ak in reduce", details: context.key });
            context.write({
                key: context.key,
                value: context.values.length
            });
        },
        summarize: (context) => {
            log.error({ title: "Ak in summarize", details: "Summary stage started" });
            log.audit({
                title: 'Usage units consumed',
                details: context.usage
            });
            log.audit({
                title: 'Concurrency',
                details: context.concurrency
            });
            log.audit({
                title: 'Number of yields',
                details: context.yields
            });
            let text = '';
            let totalKeysSaved = 0;
            context.output.iterator().each((key, value) => {
                text += `${key} ${value}\n`;
                totalKeysSaved++;
                return true;
            });
            log.audit({
                title: 'Unique number of letters used in string',
                details: totalKeysSaved
            });
            const fileObj = file.create({
                name: 'letter_count_result.txt',
                fileType: file.Type.PLAINTEXT,
                contents: text
            });
            fileObj.folder = -15;
            const fileId = fileObj.save();
            log.audit({
                title: 'Id of new file record',
                details: fileId
            });
        }
    };
    return MapReduceScript;
});

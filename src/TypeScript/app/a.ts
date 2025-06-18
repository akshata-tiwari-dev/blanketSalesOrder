/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';

export function onRequest(context: EntryPoints.Suitelet.onRequestContext) {
    const html: string = '<html><body><h1>Hello World</h1></body></html>';
    context.response.write(html);
    context.response.setHeader({
        name: 'Custom-Header-Demo',
        value: 'Demo'
    });
}


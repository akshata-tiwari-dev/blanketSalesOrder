/**
 * @jest-environment node
 */

jest.mock('N/ui/serverWidget', () => ({
    createForm: jest.fn(),
    FieldType: {

        INTEGER: 'integer',
        TEXT: 'text',
        URL: 'url',
        SELECT: 'select'

    },
    FieldDisplayType: {
        NORMAL: 'normal',
        DISABLED: 'disabled',
        HIDDEN: 'hidden'
    },
    SublistType: {
        INLINEEDITOR: 'inlineeditor'
    }
}));

jest.mock('N/cache', () => ({
    getCache: jest.fn(),
    Scope: {
        PUBLIC: 'PUBLIC'
    }
}));

jest.mock('N/url', () => ({
    resolveRecord: jest.fn().mockReturnValue('/app/accounting/transactions/salesord.nl?id=123')
}));

jest.mock('N/runtime', () => ({
    accountId: 'ACME123'
}));

jest.mock('N/record', () => ({
    load: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
}));

jest.mock('N/search', () => ({
    create: jest.fn()
}));

jest.mock('N/log', () => ({
    debug: jest.fn(),
    error: jest.fn(),
    audit: jest.fn()
}));

jest.mock('N/format', () => ({
    Type: {
        DATE: 'string'
    },
    parse: jest.fn().mockImplementation(({ value }) => new Date(value)),
    format: jest.fn().mockImplementation(({ value }) => value.toISOString().substring(0, 10))
}));

import { onRequest } from '@app/feature/popup_suitelet';
import * as cache from 'N/cache';
import * as record from 'N/record';
import * as search from 'N/search';
import * as serverWidget from 'N/ui/serverWidget';

describe('popup_suitelet onRequest – CLEAN TESTS ONLY', () => {
    const mockForm = {
        clientScriptModulePath: '',
        addField: jest.fn().mockReturnThis(),
        updateDisplayType: jest.fn().mockReturnThis(),
        addSelectOption: jest.fn(),
        addSublist: jest.fn().mockReturnValue({
            addField: jest.fn(),
            setSublistValue: jest.fn()
        }),
        addButton: jest.fn(),
        addSubmitButton: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (serverWidget.createForm as unknown as jest.Mock).mockReturnValue(mockForm);
    });

    test('POST with valid itemId and no bsoId should cache schedule', () => {
        const reverseCache = { get: jest.fn(), put: jest.fn() };
        const scheduleCache = { get: jest.fn(), put: jest.fn() };

        (cache.getCache as unknown as jest.Mock).mockImplementation(({ name }) =>
            name === 'item_schedule_cache' ? scheduleCache :
                name === 'item_schedule_latest' ? reverseCache :
                    null
        );

        const req: any = {
            method: 'POST',
            body: JSON.stringify({
                scheduleCode: 'code123',
                scheduleData: [{ date: '2025-07-01', qty: 10 }],
                itemId: 'item1',
                releaseFreq: 'b',
                quantity: '10',
                startDate: '2025-07-01',
                endDate: '2025-07-10'
            })
        };
        const res: any = { write: jest.fn(), setHeader: jest.fn() };

        onRequest({ request: req, response: res });

        expect(scheduleCache.put).toHaveBeenCalled();
        expect(reverseCache.put).toHaveBeenCalled();
        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });

    test('POST with missing body should return error', () => {
        const req: any = { method: 'POST', body: '' };
        const res: any = { write: jest.fn(), setHeader: jest.fn() };

        onRequest({ request: req, response: res });

        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"success":false'));
    });
});
// ... your existing mock setup above remains unchanged

describe('popup_suitelet onRequest – CLEAN TESTS ONLY', () => {
    const mockForm = {
        clientScriptModulePath: '',
        addField: jest.fn().mockReturnThis(),
        updateDisplayType: jest.fn().mockReturnThis(),
        addSelectOption: jest.fn(),
        addSublist: jest.fn().mockReturnValue({
            addField: jest.fn(),
            setSublistValue: jest.fn()
        }),
        addButton: jest.fn(),
        addSubmitButton: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (serverWidget.createForm as unknown as jest.Mock).mockReturnValue(mockForm);
    });

    test('POST with valid itemId and no bsoId should cache schedule', () => {
        const reverseCache = { get: jest.fn(), put: jest.fn() };
        const scheduleCache = { get: jest.fn(), put: jest.fn() };

        (cache.getCache as unknown as jest.Mock).mockImplementation(({ name }) =>
            name === 'item_schedule_cache' ? scheduleCache :
                name === 'item_schedule_latest' ? reverseCache :
                    null
        );

        const req: any = {
            method: 'POST',
            body: JSON.stringify({
                scheduleCode: 'code123',
                scheduleData: [{ date: '2025-07-01', qty: 10 }],
                itemId: 'item1',
                releaseFreq: 'b',
                quantity: '10',
                startDate: '2025-07-01',
                endDate: '2025-07-10'
            })
        };
        const res: any = { write: jest.fn(), setHeader: jest.fn() };

        onRequest({ request: req, response: res });

        expect(scheduleCache.put).toHaveBeenCalled();
        expect(reverseCache.put).toHaveBeenCalled();
        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });

    test('POST with missing body should return error', () => {
        const req: any = { method: 'POST', body: '' };
        const res: any = { write: jest.fn(), setHeader: jest.fn() };

        onRequest({ request: req, response: res });

        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"success":false'));
    });

    // ✅ Additional Tests Below



    test('POST should fail gracefully on invalid JSON', () => {
        const req: any = {
            method: 'POST',
            body: '{invalid: "json"}'
        };
        const res: any = { write: jest.fn(), setHeader: jest.fn() };

        onRequest({ request: req, response: res });

        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"success":false'));
    });

    test('POST should handle missing itemId or scheduleData', () => {
        const req: any = {
            method: 'POST',
            body: JSON.stringify({ itemId: '', scheduleData: null })
        };
        const res: any = { write: jest.fn(), setHeader: jest.fn() };

        onRequest({ request: req, response: res });

        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"success":false'));
    });

    test('POST with bsoId should update record and save schedules', () => {
        const itemLineSearchMock = {
            run: jest.fn().mockReturnValue({
                getRange: () => [{ getValue: () => 'line123' }]
            })
        };
        const scheduleSearchMock = {
            run: jest.fn().mockReturnValue({
                each: jest.fn((cb) => { cb({ getValue: () => 'sch456' }); return true; })
            })
        };
        const loadedRecord = {
            setValue: jest.fn(),
            save: jest.fn()
        };

        (search.create as unknown as jest.Mock).mockImplementation(({ type }) =>
            type === 'customrecord_item' ? itemLineSearchMock : scheduleSearchMock
        );

        (record.load as unknown as jest.Mock).mockReturnValue(loadedRecord);
        (record.delete as unknown as jest.Mock).mockReturnValue(true);
        (record.create as unknown as jest.Mock).mockReturnValue({
            setValue: jest.fn(),
            save: jest.fn()
        });

        const req: any = {
            method: 'POST',
            body: JSON.stringify({
                itemId: 'item123',
                bsoId: 'bso999',
                scheduleData: [{ date: '2025-07-01', qty: 5 }]
            })
        };
        const res: any = { write: jest.fn(), setHeader: jest.fn() };

        onRequest({ request: req, response: res });

        expect(record.create).toHaveBeenCalled();
        expect(record.load).toHaveBeenCalled();
        expect(record.delete).toHaveBeenCalled();
        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });


});


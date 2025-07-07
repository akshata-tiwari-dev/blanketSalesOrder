/**
 * @jest-environment node
 */

jest.mock('N/ui/serverWidget', () => ({
    createForm: jest.fn(),
    FieldType: {
        DATE: 'date',
        TEXT: 'text',
        INTEGER: 'integer',
        SELECT: 'select',
        INLINEHTML: 'inlinehtml'
    },
    SublistType: {
        INLINEEDITOR: 'inlineeditor'
    },
    FieldDisplayType: {
        HIDDEN: 'hidden'
    }
}));

jest.mock('N/cache', () => ({
    getCache: jest.fn(),
    Scope: {
        PUBLIC: 'PUBLIC'
    }
}));

jest.mock('N/log', () => ({
    audit: jest.fn(),
    error: jest.fn()
}));



import { onRequest } from '@app/feature/suitelet';
import * as cache from 'N/cache';
import * as log from 'N/log';
import * as serverWidget from 'N/ui/serverWidget';

jest.mock('N/cache', () => ({
    getCache: jest.fn(),
    Scope: {
        PUBLIC: 'PUBLIC',
        PRIVATE: 'PRIVATE',
        PROTECTED: 'PROTECTED'
    }
}));

describe('Suitelet onRequest', () => {
    let request: any;
    let response: any;
    const mockCache = {
        name: 'mock',
        scope: 'PUBLIC',
        get: jest.fn(),
        put: jest.fn(),
        remove: jest.fn()
    };

    beforeEach(() => {
        (cache.getCache as jest.Mock).mockReturnValue(mockCache);

        request = { method: 'GET', parameters: {}, body: '' };
        response = {
            write: jest.fn(),
            writePage: jest.fn(),
            setHeader: jest.fn()
        };

        jest.spyOn(serverWidget, 'createForm').mockReturnValue({
            clientScriptModulePath: '',
            addField: jest.fn().mockImplementation(() => ({
                defaultValue: '',
                updateDisplayType: jest.fn(),
                addSelectOption: jest.fn()
            })),
            addSublist: jest.fn().mockReturnValue({
                addField: jest.fn(),
                setSublistValue: jest.fn()
            }),
            addButton: jest.fn(),
            addSubmitButton: jest.fn()
        } as any);


        jest.spyOn(log, 'audit').mockImplementation(jest.fn());
        jest.spyOn(log, 'error').mockImplementation(jest.fn());
    });

    it('should write error if itemid is missing', () => {
        onRequest({ request, response } as any);
        expect(response.write).toHaveBeenCalledWith('Missing itemid parameter');
    });
    it('should initialize new schedule on cache miss', () => {
        request.parameters.itemid = '123';

        // Simulate cache miss (no latest code in reverseCache, and nothing in scheduleCache)
        const reverseCache = {
            get: jest.fn().mockReturnValue(''),
            put: jest.fn()
        };
        const scheduleCache = {
            get: jest.fn().mockReturnValue(null),
            put: jest.fn()
        };

        // Return the correct mocks depending on cache name
        (cache.getCache as jest.Mock).mockImplementation(({ name }) => {
            if (name === 'item_schedule_latest') return reverseCache;
            if (name === 'item_schedule_cache') return scheduleCache;
            return mockCache;
        });

        onRequest({ request, response } as any);

        expect(scheduleCache.put).toHaveBeenCalledWith(expect.objectContaining({
            key: expect.stringContaining('123'),
            value: expect.any(String),
            ttl: 3600
        }));
        expect(reverseCache.put).toHaveBeenCalledWith(expect.objectContaining({
            key: 'last-schedule-for-item-123',
            value: expect.any(String),
            ttl: 300
        }));
        expect(response.writePage).toHaveBeenCalled();
    });

    it('should load cached schedule data if cache hit', () => {
        request.parameters.itemid = '456';
        const reverseCache = {
            get: jest.fn().mockReturnValue('456-latest'),
            put: jest.fn()
        };
        const scheduleCache = {
            get: jest.fn().mockReturnValue(JSON.stringify({
                scheduleData: [{ date: '2025-07-01T00:00:00.000Z', qty: 10 }],
                startDate: '2025-07-01',
                endDate: '2025-07-10',
                quantity: '10',
                releaseFreq: 'b'
            })),
            put: jest.fn()
        };

        (cache.getCache as jest.Mock).mockImplementation(({ name }) => {
            if (name === 'item_schedule_latest') return reverseCache;
            if (name === 'item_schedule_cache') return scheduleCache;
            return mockCache;
        });

        onRequest({ request, response } as any);

        expect(response.writePage).toHaveBeenCalled();
    });

    it('should log error if cached JSON is invalid', () => {
        request.parameters.itemid = '789';
        const reverseCache = {
            get: jest.fn().mockReturnValue('invalid-code'),
            put: jest.fn()
        };
        const scheduleCache = {
            get: jest.fn().mockReturnValue('not-valid-json'),
            put: jest.fn()
        };

        (cache.getCache as jest.Mock).mockImplementation(({ name }) => {
            if (name === 'item_schedule_latest') return reverseCache;
            if (name === 'item_schedule_cache') return scheduleCache;
            return mockCache;
        });

        onRequest({ request, response } as any);

        expect(log.error).toHaveBeenCalledWith('Failed to parse cached schedule', expect.any(Error));
        expect(response.writePage).toHaveBeenCalled();
    });

    it('should return error if POST body is missing', () => {
        request.method = 'POST';
        request.body = '';

        onRequest({ request, response } as any);

        expect(response.write).toHaveBeenCalledWith(expect.stringContaining('"success":false'));
    });

    it('should cache schedule on valid POST', () => {
        request.method = 'POST';
        request.body = JSON.stringify({
            scheduleCode: '123-abc',
            itemId: '123',
            scheduleData: [{ date: '2025-07-01', qty: 10 }],
            startDate: '2025-07-01',
            endDate: '2025-07-10',
            quantity: '10',
            releaseFreq: 'b'
        });

        const reverseCache = { get: jest.fn(), put: jest.fn() };
        const scheduleCache = { get: jest.fn(), put: jest.fn() };

        (cache.getCache as jest.Mock).mockImplementation(({ name }) => {
            if (name === 'item_schedule_cache') return scheduleCache;
            if (name === 'item_schedule_latest') return reverseCache;
            return mockCache;
        });

        onRequest({ request, response } as any);

        expect(scheduleCache.put).toHaveBeenCalled();
        expect(reverseCache.put).toHaveBeenCalled();
        expect(response.write).toHaveBeenCalledWith(expect.stringMatching(/"success":true/));
    });



});

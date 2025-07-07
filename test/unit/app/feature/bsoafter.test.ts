jest.mock('N/record', () => ({
    create: jest.fn()
}));

jest.mock('N/search', () => ({
    create: jest.fn()
}));

jest.mock('N/cache', () => ({
    getCache: jest.fn(),
    Scope: {
        PUBLIC: 'PUBLIC'
    }
}));


jest.mock('N/format', () => ({
    parse: jest.fn()
}));

jest.mock('N/log', () => ({
    debug: jest.fn(),
    error: jest.fn()
}));

import { afterSubmit } from '@app/feature/bsoafter'; // Adjust to your actual path
import * as record from 'N/record';
import * as search from 'N/search';
import * as cache from 'N/cache';
import * as format from 'N/format';
import * as log from 'N/log';

describe('bsoafter.ts - afterSubmit', () => {
    const mockGetCache = cache.getCache as unknown as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        const reverseCacheMock = {
            get: jest.fn().mockReturnValue('scheduleCode123')
        };

        const schedCacheMock = {
            get: jest.fn().mockReturnValue(JSON.stringify({
                scheduleData: [
                    { date: '2025-07-01', qty: 10 },
                    { date: '2025-07-10', qty: 15 }
                ]
            }))
        };

        mockGetCache.mockImplementation(({ name }) => {
            return name === 'item_schedule_latest' ? reverseCacheMock : schedCacheMock;
        });

        (search.create as unknown as jest.Mock).mockReturnValue({
            run: () => ({
                each: (callback: Function) => {
                    callback({
                        getValue: ({ name }: any) => {
                            if (name === 'internalid') return 'line123';
                            if (name === 'custrecord_itemid') return 'item456';
                            return null;
                        }
                    });
                    return true;
                }
            })
        });

        (format.parse as unknown as jest.Mock).mockImplementation(({ value }) => value);

        (record.create as unknown as jest.Mock).mockReturnValue({
            setValue: jest.fn(),
            save: jest.fn().mockReturnValue('sched789')
        });
    });

    it('should skip if context type is DELETE', () => {
        const context: any = {
            type: 'delete',
            newRecord: { id: 'bso1' },
            UserEventType: { DELETE: 'delete' }
        };

        afterSubmit(context);
        expect(record.create).not.toHaveBeenCalled();
    });

    it('should create schedules if schedule data is found', () => {
        const context: any = {
            type: 'create',
            newRecord: { id: 'bso1' },
            UserEventType: { DELETE: 'delete' }
        };

        afterSubmit(context);
        expect(record.create).toHaveBeenCalledTimes(2); // Two schedule entries
    });

    it('should handle invalid JSON in schedule data gracefully', () => {
        mockGetCache.mockImplementation(({ name }) => {
            return {
                get: () => '{invalidJson}'
            };
        });

        const context: any = {
            type: 'edit',
            newRecord: { id: 'bso1' },
            UserEventType: { DELETE: 'delete' }
        };

        afterSubmit(context);

        expect(log.error).toHaveBeenCalledWith('Failed to parse schedule data', expect.any(String));
    });

    it('should skip if no schedule code in cache', () => {
        mockGetCache.mockImplementation(({ name }) => {
            return {
                get: () => null
            };
        });

        const context: any = {
            type: 'create',
            newRecord: { id: 'bso1' },
            UserEventType: { DELETE: 'delete' }
        };

        afterSubmit(context);
        expect(record.create).not.toHaveBeenCalled();
        expect(log.debug).toHaveBeenCalledWith('No schedule code in cache', 'Item item456');
    });

    it('should skip if scheduleData is empty', () => {
        mockGetCache.mockImplementation(({ name }) => {
            return {
                get: () => JSON.stringify({ scheduleData: [] })
            };
        });

        const context: any = {
            type: 'create',
            newRecord: { id: 'bso1' },
            UserEventType: { DELETE: 'delete' }
        };

        afterSubmit(context);
        expect(record.create).not.toHaveBeenCalled();
    });
});

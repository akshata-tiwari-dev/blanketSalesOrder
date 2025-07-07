/**
 * @jest-environment jsdom
 */

jest.mock('N/currentRecord', () => ({
    get: jest.fn()
}));

import { autoGenerateSchedule ,saveRecord, pageInit, saveScheduleToCache  } from '@app/feature/clientscript'; // Adjust path
import * as currentRecord from 'N/currentRecord';

describe('autoGenerateSchedule', () => {
    let mockRecord: any;

    beforeEach(() => {
        global.alert = jest.fn(); // Mock global alert
        mockRecord = {
            getValue: jest.fn(),
            getLineCount: jest.fn(),
            getSublistValue: jest.fn(),
            selectNewLine: jest.fn(),
            setCurrentSublistValue: jest.fn(),
            commitLine: jest.fn()
        };
        (currentRecord.get as unknown as jest.Mock).mockReturnValue(mockRecord);
        (window as any).isGenerated = false;
    });

    it('should alert if already generated', () => {
        (window as any).isGenerated = true;

        autoGenerateSchedule();
        expect(global.alert).toHaveBeenCalledWith('Schedule has already been auto-generated.');
    });

    it('should alert if any required field is missing', () => {
        mockRecord.getValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custpage_start_date') return '';
            if (fieldId === 'custpage_end_date') return '';
            if (fieldId === 'custpage_quantity') return '';
            if (fieldId === 'custpage_release_freq') return '';
            return null;
        });

        autoGenerateSchedule();
        expect(global.alert).toHaveBeenCalledWith('Please fill all required fields.');
    });

    it('should alert if total quantity already fulfilled', () => {
        mockRecord.getValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custpage_start_date') return '2025-07-01';
            if (fieldId === 'custpage_end_date') return '2025-07-31';
            if (fieldId === 'custpage_quantity') return '100';
            if (fieldId === 'custpage_release_freq') return 'b';
        });
        mockRecord.getLineCount.mockReturnValue(1);
        mockRecord.getSublistValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custpage_release_qty') return '100';
            if (fieldId === 'custpage_release_date') return '2025-07-01';
        });

        autoGenerateSchedule();
        expect(global.alert).toHaveBeenCalledWith(
            'Total quantity in sublist (100) is equal to or exceeds total quantity (100). Auto-generation not needed.'
        );
    });

    it('should alert if date range too short', () => {
        mockRecord.getValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custpage_start_date') return '2025-07-30';
            if (fieldId === 'custpage_end_date') return '2025-07-30';
            if (fieldId === 'custpage_quantity') return '10';
            if (fieldId === 'custpage_release_freq') return 'a';
        });
        mockRecord.getLineCount.mockReturnValue(0);

        autoGenerateSchedule();
        expect(global.alert).toHaveBeenCalledWith('Date range too short or end date is before start date.');
    });

    it('should generate sublist lines and set isGenerated true', () => {
        mockRecord.getValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custpage_start_date') return '2025-07-01';
            if (fieldId === 'custpage_end_date') return '2025-07-31';
            if (fieldId === 'custpage_quantity') return '30';
            if (fieldId === 'custpage_release_freq') return 'a'; // 30-day interval
        });

        mockRecord.getLineCount.mockReturnValue(0);
        mockRecord.getSublistValue.mockReturnValue(null);

        autoGenerateSchedule();

        expect(mockRecord.selectNewLine).toHaveBeenCalled();
        expect(mockRecord.setCurrentSublistValue).toHaveBeenCalledWith(
            expect.objectContaining({ fieldId: 'custpage_release_date' })
        );
        expect(mockRecord.commitLine).toHaveBeenCalled();
        expect((window as any).isGenerated).toBe(true);
    });
});

describe('saveRecord', () => {
    let mockContext: any;

    beforeEach(() => {
        global.alert = jest.fn();
        window.alert = global.alert;
        (window as any).close = jest.fn();
        global.fetch = jest.fn();

        mockContext = {
            currentRecord: {
                commitLine: jest.fn(),
                getLineCount: jest.fn(),
                getSublistValue: jest.fn(),
                getValue: jest.fn()
            }
        };
    });

    it('should alert and return false if totalQty does not match inputQty', () => {
        mockContext.currentRecord.getLineCount.mockReturnValue(2);
        mockContext.currentRecord.getSublistValue.mockReturnValueOnce('30').mockReturnValueOnce('20');
        mockContext.currentRecord.getValue.mockReturnValue('100');

        const result = saveRecord(mockContext);
        expect(alert).toHaveBeenCalledWith('❌ Total scheduled quantity (50) must exactly match the entered quantity (100).');
        expect(result).toBe(false);
    });
    /*
        it('should return true and call saveScheduleToCache if quantities match', () => {
            mockContext.currentRecord.getLineCount.mockReturnValue(2);
            mockContext.currentRecord.getSublistValue.mockReturnValueOnce('50').mockReturnValueOnce('50');
            mockContext.currentRecord.getValue.mockReturnValue('100');

            const clientscript = require('@app/feature/clientscript');
            const mockFn = jest.fn();

            // Temporarily override the actual function on the module directly
            const originalFn = clientscript.saveScheduleToCache;
            clientscript.saveScheduleToCache = mockFn;

            // Now call saveRecord (which is already imported above) — it'll use the new mocked function
            const result = saveRecord(mockContext);

            expect(result).toBe(true);
            expect(mockFn).toHaveBeenCalled();

            // Restore the original function so other tests aren’t affected
            clientscript.saveScheduleToCache = originalFn;
        });
    */

    it('should not throw if commitLine fails', () => {
        mockContext.currentRecord.commitLine.mockImplementation(() => { throw new Error('mock'); });
        mockContext.currentRecord.getLineCount.mockReturnValue(0);
        mockContext.currentRecord.getValue.mockReturnValue('0');

        const result = saveRecord(mockContext);
        expect(result).toBe(true); // because it gracefully handles commitLine error
    });
});

describe('pageInit', () => {
    let mockRecord: any;

    beforeEach(() => {
        global.console.error = jest.fn();

        mockRecord = {
            setValue: jest.fn(),
            selectNewLine: jest.fn(),
            setCurrentSublistValue: jest.fn(),
            commitLine: jest.fn()
        };

        (currentRecord.get as unknown as jest.Mock).mockReturnValue(mockRecord);
    });

    it('should preload fields from scheduleMeta', () => {
        window.scheduleMeta = {
            startDate: '2025-07-01',
            endDate: '2025-07-31',
            quantity: '100',
            releaseFreq: 'b'
        };
        window.scheduleLines = [];

        pageInit({});

        expect(mockRecord.setValue).toHaveBeenCalledWith({ fieldId: 'custpage_start_date', value: '2025-07-01' });
        expect(mockRecord.setValue).toHaveBeenCalledWith({ fieldId: 'custpage_quantity', value: 100 });
    });

    it('should populate sublist from scheduleLines', () => {
        window.scheduleMeta = {};
        window.scheduleLines = [
            { date: '2025-07-10', qty: 20 },
            { date: '2025-07-20', qty: 30 }
        ];

        pageInit({});

        expect(mockRecord.selectNewLine).toHaveBeenCalledTimes(2);
        expect(mockRecord.setCurrentSublistValue).toHaveBeenCalledWith({
            sublistId: 'custpage_schedule_sublist',
            fieldId: 'custpage_release_date',
            value: '2025-07-10'
        });
        expect(mockRecord.commitLine).toHaveBeenCalledTimes(2);
        expect(window.isGenerated).toBe(true);
    });

    it('should handle missing meta and lines safely', () => {
        window.scheduleMeta = undefined;
        window.scheduleLines = [];

        pageInit({});

        expect(window.isGenerated).toBe(false);
        expect(mockRecord.setValue).not.toHaveBeenCalled();
        expect(mockRecord.selectNewLine).not.toHaveBeenCalled();
    });

    it('should log error on failure', () => {
        (currentRecord.get as unknown as jest.Mock).mockImplementation(() => { throw new Error('fail test'); });

        pageInit({});

        expect(console.error).toHaveBeenCalledWith('Preload failed:', 'fail test');
    });
});


describe('saveScheduleToCache', () => {
    let mockRecord: any;

    beforeEach(() => {
        global.fetch = jest.fn();
        global.alert = jest.fn();
        window.alert = global.alert;
        (window as any).close = jest.fn();

        const event = new Event('submit');
        Object.defineProperty(window, 'event', {
            value: event,
            writable: true
        });
        (window.event as Event).preventDefault = jest.fn();

        mockRecord = {
            getValue: jest.fn(),
            getLineCount: jest.fn(),
            getSublistValue: jest.fn()
        };

        (currentRecord.get as unknown as jest.Mock).mockReturnValue(mockRecord);
    });

    it('should alert if required fields are missing', () => {
        mockRecord.getValue.mockReturnValue('');
        mockRecord.getLineCount.mockReturnValue(0);

        saveScheduleToCache();
        expect(global.alert).toHaveBeenCalledWith('Missing required data.');
    });

    it('should send POST request with correct payload', async () => {
        mockRecord.getValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custpage_schedule_code') return 'SCH123';
            if (fieldId === 'custpage_item_id') return 'ITEM456';
            if (fieldId === 'custpage_start_date') return '2025-07-01';
            if (fieldId === 'custpage_end_date') return '2025-07-31';
            if (fieldId === 'custpage_quantity') return '100';
            if (fieldId === 'custpage_release_freq') return 'a';
            return '';
        });
        mockRecord.getLineCount.mockReturnValue(2);
        mockRecord.getSublistValue.mockImplementation(({ fieldId, line }: any) => {
            if (fieldId === 'custpage_release_date') return line === 0 ? '2025-07-10' : '2025-07-20';
            if (fieldId === 'custpage_release_qty') return line === 0 ? '50' : '50';
        });

        (fetch as jest.Mock).mockResolvedValue({ json: async () => ({ success: true }) });

        await saveScheduleToCache();

        expect(fetch).toHaveBeenCalledWith('/app/site/hosting/scriptlet.nl?script=152&deploy=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId: 'ITEM456',
                scheduleCode: 'SCH123',
                scheduleData: [
                    { date: '2025-07-10', qty: 50 },
                    { date: '2025-07-20', qty: 50 }
                ],
                startDate: '2025-07-01',
                endDate: '2025-07-31',
                quantity: '100',
                releaseFreq: 'a'
            })
        });
    });


});
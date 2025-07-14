/**
 * @jest-environment jsdom
 */

jest.mock('N/currentRecord', () => ({
    get: jest.fn()
}));

import { autoGenerateSchedule ,saveRecord, pageInit, saveScheduleToCache  } from '@app/feature/popup_client'; // Adjust path
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


});



import * as query from 'N/query';
import * as log from 'N/log';
import { getInputData,  map, reduce } from '@app/feature/createSO_mr';
import * as record from 'N/record';


jest.mock('N/query', () => ({
    runSuiteQL: jest.fn()
}));

jest.mock('N/log', () => ({
    audit: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
}));

jest.mock('N/record', () => ({
    create: jest.fn(),
    Type: {
        SALES_ORDER: 'salesorder'
    }
}));


describe('Map/Reduce - getInputData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //1. suitql returns and properly mapped to json.stringfy
    it('should return results from SuiteQL as JSON strings', () => {
        const mockResults = [
            { schedule_id: 'S1', quantity: 10 },//dum
            { schedule_id: 'S2', quantity: 20 }
        ];

        (query.runSuiteQL as unknown as jest.Mock).mockReturnValue({
            asMappedResults: () => mockResults
        });

        const input = getInputData({} as any); // <-- mock context

        expect(input).toEqual(mockResults.map((r) => JSON.stringify(r)));
        expect(log.audit).toHaveBeenCalledWith('SuiteQL Result Count', mockResults.length);
    });

    //2. empty array if no sql found
    it('should return empty array if no SuiteQL rows found', () => {
        (query.runSuiteQL as unknown as jest.Mock).mockReturnValue({
            asMappedResults: () => []
        });

        const input = getInputData({} as any);

        expect(input).toEqual([]);
        expect(log.audit).toHaveBeenCalledWith('No Results Found', 'SuiteQL returned 0 rows');
    });
    // Test 3: SuiteQL throws an error
    it('should log error and return empty array if SuiteQL fails', () => {
        (query.runSuiteQL as unknown as jest.Mock).mockImplementation(() => {
            throw new Error('Query crashed');
        });

        const input = getInputData({} as any);

        expect(input).toEqual([]);
        expect(log.error).toHaveBeenCalledWith('SuiteQL Error', 'Query crashed');
    });
});

describe('Map/Reduce - map', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should emit data grouped by customer ID', () => {
        const mockWrite = jest.fn();
        const sampleData = {
            schedule_id: '123',
            release_date: new Date().toISOString(), // today
            customer_id: '456',
            item_id: '789',
            quantity: 10,
            rate: 100
        };

        const context = {
            value: JSON.stringify(sampleData),
            write: mockWrite
        };

        map(context as any);

        expect(mockWrite).toHaveBeenCalledWith({
            key: '456',
            value: JSON.stringify(sampleData)
        });
    });

    it('should log "Today Match" if release_date is today', () => {
        const mockWrite = jest.fn();
        const todayISO = new Date().toISOString();

        const sampleData = {
            schedule_id: 'abc123',
            release_date: todayISO,
            customer_id: '789',
        };

        const context = {
            value: JSON.stringify(sampleData),
            write: mockWrite
        };

        map(context as any);

        expect(log.audit).toHaveBeenCalledWith(
            'Today Match',
            expect.stringContaining('Schedule ID abc123')
        );
    });

    it('should log "Not Today" if release_date is not today', () => {
        const mockWrite = jest.fn();
        const yesterday = new Date(Date.now() - 86400000).toISOString(); // 1 day ago

        const sampleData = {
            schedule_id: 'xyz789',
            release_date: yesterday,
            customer_id: '111',
        };

        const context = {
            value: JSON.stringify(sampleData),
            write: mockWrite
        };

        map(context as any);

        expect(log.audit).toHaveBeenCalledWith(
            'Not Today',
            expect.stringContaining('Schedule ID xyz789')
        );
    });


});

describe('Map/Reduce - reduce', () => {

    it('should create a Sales Order for the customer with correct values', () => {
        const mockSetValue = jest.fn();
        const mockSelectNewLine = jest.fn();
        const mockSetCurrentSublistValue = jest.fn();
        const mockCommitLine = jest.fn();
        const mockSave = jest.fn().mockReturnValue('SO123');

        (record.create as unknown as jest.Mock).mockReturnValue({
            setValue: mockSetValue,
            selectNewLine: mockSelectNewLine,
            setCurrentSublistValue: mockSetCurrentSublistValue,
            commitLine: mockCommitLine,
            save: mockSave
        });

        const context = {
            key: '456',
            values: [
                JSON.stringify({
                    item_id: '1001',
                    quantity: 2,
                    rate: 150,
                    release_date: new Date().toISOString()
                })
            ]
        };

        reduce(context as any);

        expect(record.create).toHaveBeenCalledWith({
            type: record.Type.SALES_ORDER,
            isDynamic: true
        });

        expect(mockSetValue).toHaveBeenCalledWith({ fieldId: 'entity', value: 456 });
        expect(mockSetValue).toHaveBeenCalledWith({ fieldId: 'custbodyiscreated', value: true });
        expect(mockSetValue).toHaveBeenCalledWith({
            fieldId: 'trandate',
            value: expect.any(Date)
        });

        expect(mockSave).toHaveBeenCalled();
        expect(log.audit).toHaveBeenCalledWith('Sales Order Created', expect.stringContaining('Customer: 456'));
    });

    it('should create multiple line items for same customer', () => {
        const mockSelectNewLine = jest.fn();
        const mockSetCurrentSublistValue = jest.fn();
        const mockCommitLine = jest.fn();
        const mockSave = jest.fn().mockReturnValue('SO222');

        (record.create as unknown as jest.Mock).mockReturnValue({
            setValue: jest.fn(),
            selectNewLine: mockSelectNewLine,
            setCurrentSublistValue: mockSetCurrentSublistValue,
            commitLine: mockCommitLine,
            save: mockSave
        });

        const context = {
            key: '999',
            values: [
                JSON.stringify({ item_id: '100', quantity: 1, rate: 10, release_date: new Date().toISOString() }),
                JSON.stringify({ item_id: '200', quantity: 2, rate: 20, release_date: new Date().toISOString() })
            ]
        };

        reduce(context as any);

        expect(mockSelectNewLine).toHaveBeenCalledTimes(2);
        expect(mockCommitLine).toHaveBeenCalledTimes(2);
    });


    it('should log an error if Sales Order creation fails', () => {
        (record.create as unknown as jest.Mock).mockImplementation(() => {
            throw new Error('Creation failed');
        });

        const context = {
            key: 'error-case',
            values: [
                JSON.stringify({ item_id: '404', quantity: 1, rate: 10, release_date: new Date().toISOString() })
            ]
        };

        reduce(context as any);

        expect(log.error).toHaveBeenCalledWith(
            'SO creation failed for Customer error-case',
            'Creation failed'
        );
    });

    it('should fallback rate to 0 if rate is null or NaN', () => {
        const mockSetCurrentSublistValue = jest.fn();

        (record.create as unknown as jest.Mock).mockReturnValue({
            setValue: jest.fn(),
            selectNewLine: jest.fn(),
            setCurrentSublistValue: mockSetCurrentSublistValue,
            commitLine: jest.fn(),
            save: jest.fn()
        });

        const context = {
            key: '789',
            values: [JSON.stringify({
                item_id: '300',
                quantity: 1,
                rate: null,
                release_date: new Date().toISOString()
            })]
        };

        reduce(context as any);

        expect(mockSetCurrentSublistValue).toHaveBeenCalledWith({
            sublistId: 'item',
            fieldId: 'rate',
            value: 0
        });
    });



});

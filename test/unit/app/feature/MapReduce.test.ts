import * as query from 'N/query';
import * as log from 'N/log';
import { getInputData } from '@app/feature/MapReduce'; // adjust path

jest.mock('N/query', () => ({
    runSuiteQL: jest.fn()
}));

jest.mock('N/log', () => ({
    audit: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
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

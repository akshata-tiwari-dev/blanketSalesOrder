/**
 * @jest-environment jsdom
 */

jest.mock('N/currentRecord', () => ({
    get: jest.fn()
}));

declare global {
    var nlExtOpenWindow: jest.Mock;
}

import { fieldChanged } from '@app/feature/fpop';
import * as currentRecord from 'N/currentRecord';

describe('fieldChanged', () => {
    let mockContext: any;
    let mockRecord: any;

    beforeEach(() => {
        global.nlExtOpenWindow = jest.fn();

        jest.clearAllMocks();
        jest.spyOn(window, 'alert').mockImplementation(jest.fn());

        global.nlExtOpenWindow = jest.fn();

        mockRecord = {};
        (currentRecord.get as unknown as jest.Mock).mockReturnValue(mockRecord);

        mockContext = {
            currentRecord: {
                getCurrentSublistValue: jest.fn()
            }
        };
    });

    it('should do nothing if checkbox is not checked', () => {
        mockContext.currentRecord.getCurrentSublistValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custrecord_gensch') return false;
            return '123'; // simulate itemId
        });

        fieldChanged(mockContext);

        expect(alert).not.toHaveBeenCalled();
        expect(nlExtOpenWindow).not.toHaveBeenCalled();
    });

    it('should alert if checkbox is checked but itemId is missing', () => {
        mockContext.currentRecord.getCurrentSublistValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custrecord_gensch') return true;
            if (fieldId === 'custrecord_itemid') return null;
        });

        fieldChanged(mockContext);

        expect(alert).toHaveBeenCalledWith('Please save the record before creating a schedule.');
        expect(nlExtOpenWindow).not.toHaveBeenCalled();
    });

    it('should alert and open window if checkbox is checked and itemId is present', () => {
        mockContext.currentRecord.getCurrentSublistValue.mockImplementation(({ fieldId }: any) => {
            if (fieldId === 'custrecord_gensch') return true;
            if (fieldId === 'custrecord_itemid') return '456';
        });

        fieldChanged(mockContext);

        const expectedUrl = `/app/site/hosting/scriptlet.nl?script=152&deploy=1&itemid=456`;

        expect(alert).toHaveBeenCalledWith(expectedUrl);
        expect(nlExtOpenWindow).toHaveBeenCalledWith(
            encodeURI(expectedUrl),
            'EditSchedule',
            800,
            600
        );
    });
});

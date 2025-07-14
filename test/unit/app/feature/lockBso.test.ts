/**
 * @jest-environment node
 */

jest.mock('N/ui/serverWidget', () => ({
    FieldDisplayType: {
        NORMAL: 'NORMAL',
        DISABLED: 'DISABLED',
        HIDDEN: 'HIDDEN'
    }
}));

jest.mock('N/log', () => ({
    debug: jest.fn(),
    error: jest.fn()
}));

const { beforeLoad } = require('@app/feature/lockBso_ue'); // CommonJS import for TS export=
import * as serverWidget from 'N/ui/serverWidget';
import * as log from 'N/log';

describe('beforeLoad User Event Script', () => {
    let mockForm: any;
    let mockRecord: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockForm = {
            getField: jest.fn(),
            getSublist: jest.fn(),
            removeButton: jest.fn()
        };

        mockRecord = {
            getValue: jest.fn()
        };
    });

    it('disables fields and updates sublist when status is 1', () => {
        mockRecord.getValue.mockReturnValue(1);

        const disabledFields: Record<string, string> = {};
        const sublistFields: Record<string, string> = {};

        mockForm.getField.mockImplementation(({ id }: { id: string }) => ({
            id,
            updateDisplayType: ({ displayType }: { displayType: string }) => {
                disabledFields[id] = displayType;
            }
        }));

        const mockSublistField = (id: string) => ({
            id,
            updateDisplayType: ({ displayType }: { displayType: string }) => {
                sublistFields[id] = displayType;
            }
        });

        mockForm.getSublist.mockReturnValue({
            getField: jest.fn().mockImplementation(({ id }: { id: string }) => mockSublistField(id))
        });

        const context = {
            type: 'edit',
            form: mockForm,
            newRecord: mockRecord
        };

        beforeLoad(context);

        expect(disabledFields['custrecord_customer']).toBe(serverWidget.FieldDisplayType.DISABLED);
        expect(disabledFields['custrecord127']).toBe(serverWidget.FieldDisplayType.DISABLED);

        expect(sublistFields['custrecord_itemid']).toBe(serverWidget.FieldDisplayType.DISABLED);
        expect(sublistFields['custrecord_gensch']).toBe(serverWidget.FieldDisplayType.NORMAL);

        expect(mockForm.removeButton).toHaveBeenCalledWith({ id: 'submit' });
    });

    it('does not modify form if status is not 1 or 3', () => {
        mockRecord.getValue.mockReturnValue(2); // Not a lock status

        const context = {
            type: 'edit',
            form: mockForm,
            newRecord: mockRecord
        };

        beforeLoad(context);

        expect(mockForm.getField).not.toHaveBeenCalled();
        expect(mockForm.removeButton).not.toHaveBeenCalled();
    });

    it('handles missing sublist gracefully', () => {
        mockRecord.getValue.mockReturnValue(1);
        mockForm.getField.mockReturnValue({
            updateDisplayType: jest.fn()
        });
        mockForm.getSublist.mockReturnValue(null); // simulate missing sublist

        const context = {
            type: 'edit',
            form: mockForm,
            newRecord: mockRecord
        };

        beforeLoad(context);

        expect(log.debug).toHaveBeenCalledWith('Sublist not found', 'recmachcustrecord_bso_item_sublist_link');
    });

    it('handles exceptions when removing submit button', () => {
        mockRecord.getValue.mockReturnValue(3);
        mockForm.getField.mockReturnValue({ updateDisplayType: jest.fn() });
        mockForm.getSublist.mockReturnValue({ getField: jest.fn() });
        mockForm.removeButton.mockImplementation(() => { throw new Error('test'); });

        const context = {
            type: 'edit',
            form: mockForm,
            newRecord: mockRecord
        };

        expect(() => beforeLoad(context)).not.toThrow(); // Should handle internally
    });

    it('skips logic if not edit or view type', () => {
        const context = {
            type: 'create',
            form: mockForm,
            newRecord: mockRecord
        };

        beforeLoad(context);

        expect(mockForm.getField).not.toHaveBeenCalled();
        expect(mockForm.getSublist).not.toHaveBeenCalled();
    });
});

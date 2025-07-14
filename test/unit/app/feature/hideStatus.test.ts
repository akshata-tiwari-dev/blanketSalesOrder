/**
 * @jest-environment node
 */

jest.mock('N/ui/serverWidget', () => ({
    FieldDisplayType: {
        HIDDEN: 'HIDDEN',
        NORMAL: 'NORMAL'
    }
}));

const { beforeLoad } = require('@app/feature/hideStatus_ue'); // adjust path if needed
import * as serverWidget from 'N/ui/serverWidget';

describe('approvalField_ue.ts - beforeLoad', () => {
    let mockForm: any;
    let mockRecord: any;
    let mockField: any;

    beforeEach(() => {
        mockField = {
            updateDisplayType: jest.fn()
        };

        mockForm = {
            getField: jest.fn().mockReturnValue(mockField)
        };

        mockRecord = {
            setValue: jest.fn()
        };
    });

    it('should hide field on CREATE', () => {
        const context = {
            type: 'create',
            form: mockForm,
            newRecord: mockRecord,
            UserEventType: {
                CREATE: 'create',
                EDIT: 'edit',
                VIEW: 'view'
            }
        };

        beforeLoad(context);

        expect(mockForm.getField).toHaveBeenCalledWith({ id: 'custrecord127' });
        expect(mockField.updateDisplayType).toHaveBeenCalledWith({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        expect(mockRecord.setValue).toHaveBeenCalledWith({
            fieldId: 'custrecord127',
            value: 2
        });
    });

    it('should show field on EDIT and VIEW', () => {
        ['edit', 'view'].forEach((type) => {
            mockField.updateDisplayType.mockClear();
            mockRecord.setValue.mockClear();

            const context = {
                type,
                form: mockForm,
                newRecord: mockRecord,
                UserEventType: {
                    CREATE: 'create',
                    EDIT: 'edit',
                    VIEW: 'view'
                }
            };

            beforeLoad(context);

            expect(mockField.updateDisplayType).toHaveBeenCalledWith({
                displayType: serverWidget.FieldDisplayType.NORMAL
            });
            expect(mockRecord.setValue).toHaveBeenCalledWith({
                fieldId: 'custrecord127',
                value: 2
            });
        });
    });

    it('should not throw if field not found', () => {
        mockForm.getField = jest.fn().mockReturnValue(null);

        const context = {
            type: 'edit',
            form: mockForm,
            newRecord: mockRecord,
            UserEventType: {
                CREATE: 'create',
                EDIT: 'edit',
                VIEW: 'view'
            }
        };

        expect(() => beforeLoad(context)).not.toThrow();
        expect(mockRecord.setValue).not.toHaveBeenCalled();
    });

    it('should skip displayType update on unknown context.type but still set value', () => {
        const context = {
            type: 'delete',
            form: mockForm,
            newRecord: mockRecord,
            UserEventType: {
                CREATE: 'create',
                EDIT: 'edit',
                VIEW: 'view'
            }
        };

        beforeLoad(context);

        expect(mockField.updateDisplayType).not.toHaveBeenCalled();
        expect(mockRecord.setValue).toHaveBeenCalledWith({
            fieldId: 'custrecord127',
            value: 2
        });
    });
});

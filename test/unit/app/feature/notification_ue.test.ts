jest.mock('N/email', () => ({
    send: jest.fn()
}));

jest.mock('N/log', () => ({
    debug: jest.fn(),
    error: jest.fn(),
    audit: jest.fn()
}));

jest.mock('N/record', () => ({
    load: jest.fn(),
    Type: {
        CUSTOMER: 'customer' // Ensures correct type reference
    }
}));

jest.mock('N/runtime', () => ({
    getCurrentUser: jest.fn()
}));

import { afterSubmit } from '@app/feature/notification_ue';
import * as email from 'N/email';
import * as record from 'N/record';
import * as runtime from 'N/runtime';
import * as log from 'N/log';

describe('notification_ue.ts - afterSubmit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Checkbox is not checked
    it('should skip email if notify checkbox is false', () => {
        const mockContext: any = {
            type: 'create',
            UserEventType: { DELETE: 'delete' },
            newRecord: {
                getValue: jest.fn(({ fieldId }) => {
                    if (fieldId === 'custrecordnotify') return false;
                    return null;
                })
            }
        };

        afterSubmit(mockContext);
        expect(email.send).not.toHaveBeenCalled();
    });

    // Test 2: Customer is missing
    it('should skip email if customer is missing', () => {
        const mockContext: any = {
            type: 'create',
            UserEventType: { DELETE: 'delete' },
            newRecord: {
                getValue: jest.fn(({ fieldId }) => {
                    if (fieldId === 'custrecordnotify') return true;
                    if (fieldId === 'custrecord_customer') return null;
                    return null;
                })
            }
        };

        afterSubmit(mockContext);
        expect(email.send).not.toHaveBeenCalled();
    });

    // Test 3: All values are valid, email should be sent
    it('should send email when all fields are valid', () => {
        const customerMock = {
            getValue: jest.fn(({ fieldId }) => {
                if (fieldId === 'email') return 'test@example.com';
                return undefined;
            })
        };

        (record.load as unknown as jest.Mock).mockReturnValue(customerMock);
        (runtime.getCurrentUser as jest.Mock).mockReturnValue({ id: 101 });

        const mockContext: any = {
            type: 'create',
            UserEventType: { DELETE: 'delete' },
            newRecord: {
                getValue: jest.fn(({ fieldId }) => {
                    if (fieldId === 'custrecordnotify') return true;
                    if (fieldId === 'custrecord_customer') return '123';
                    if (fieldId === 'id') return 'B123';
                    return null;
                })
            }
        };

        afterSubmit(mockContext);

        expect(email.send).toHaveBeenCalledWith({
            author: 101,
            recipients: 'test@example.com',
            subject: 'Order Confirmation: B123',
            body: 'Dear customer, your Blanket Sales Order B123 has been submitted successfully.'
        });
    });

    // Test 4: Customer email is missing
    it('should skip email if customer email is missing', () => {
        const customerMock = {
            getValue: jest.fn(({ fieldId }) => {
                if (fieldId === 'email') return null; // No email
                return undefined;
            })
        };

        (record.load as unknown as jest.Mock).mockReturnValue(customerMock);
        (runtime.getCurrentUser as jest.Mock).mockReturnValue({ id: 101 });

        const mockContext: any = {
            type: 'create',
            UserEventType: { DELETE: 'delete' },
            newRecord: {
                getValue: jest.fn(({ fieldId }) => {
                    if (fieldId === 'custrecordnotify') return true;
                    if (fieldId === 'custrecord_customer') return '123';
                    if (fieldId === 'id') return 'B123';
                    return null;
                })
            }
        };

        afterSubmit(mockContext);

        expect(email.send).not.toHaveBeenCalled();
        expect(log.debug).toHaveBeenCalledWith('No email found on customer', '123');
    });
    it('should log error if customer record loading fails', () => {
        (record.load as unknown as jest.Mock).mockImplementation(() => {
            throw new Error('Database failure');
        });

        const mockContext: any = {
            type: 'create',
            UserEventType: { DELETE: 'delete' },
            newRecord: {
                getValue: jest.fn(({ fieldId }) => {
                    if (fieldId === 'custrecordnotify') return true;
                    if (fieldId === 'custrecord_customer') return '123';
                    if (fieldId === 'id') return 'B123';
                    return null;
                })
            }
        };

        afterSubmit(mockContext);

        expect(log.error).toHaveBeenCalledWith('Error sending email', 'Database failure');
    });

});

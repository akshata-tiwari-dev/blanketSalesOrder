jest.mock('N/task', () => ({
    create: jest.fn()
}));

jest.mock('N/log', () => ({
    audit: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}));

jest.mock('N/task', () => ({
    create: jest.fn(),
    TaskType: {
        MAP_REDUCE: 'MAP_REDUCE'
    }
}));


import { onRequest } from '@app/feature/SO_list_suitelet'; // adjust your path
import * as task from 'N/task';
import * as log from 'N/log';

describe('Suitelet - onRequest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should trigger MR if action=runmr', () => {
        const mockSubmit = jest.fn().mockReturnValue('task123');

        (task.create as jest.Mock).mockReturnValue({
            submit: mockSubmit
        });

        const mockResponse = {
            write: jest.fn()
        };

        const context = {
            request: {
                parameters: { action: 'runmr' }
            },
            response: mockResponse
        };

        onRequest(context as any);

        expect(task.create).toHaveBeenCalledWith({
            taskType: task.TaskType.MAP_REDUCE,
            scriptId: 'customscript164',
            deploymentId: 'customdeploy1'
        });

        expect(mockSubmit).toHaveBeenCalled();
        expect(log.audit).toHaveBeenCalledWith('MR Triggered via Suitelet', expect.stringContaining('task123'));
        expect(mockResponse.write).toHaveBeenCalledWith('MR Triggered');
    });
});

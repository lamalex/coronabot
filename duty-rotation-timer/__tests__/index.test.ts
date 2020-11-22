import {
    runStubFunctionFromBindings,
    createTimerTrigger,
} from 'stub-azure-function-context';

import timerTrigger from '../index';

describe('azure timer trigger', () => {
    it('sends a text on trigger', async () => {
        const context = await runStubFunctionFromBindings(timerTrigger, [
            {
                type: 'timerTrigger',
                name: 'dutytimer',
                direction: 'in',
                data: createTimerTrigger(),
            },
            {
                type: 'http',
                direction: 'out',
                name: 'res',
            },
        ]);

        expect(context).toHaveProperty('res.status', 200);
    });
});

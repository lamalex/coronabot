import 'dotenv/config';
import {
    runStubFunctionFromBindings,
    createTimerTrigger,
} from 'stub-azure-function-context';
import { CoronaBot } from '../../nocorona';
import { Textbelt } from '../../nocorona/smsservice';

import timerTrigger, { sendNoRonaMessage, RonaConfig } from '../index';

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

describe('send no rona message', () => {
    let bot: CoronaBot;
    let config: RonaConfig;

    beforeEach(() => {
        const apiKey = process.env.TEXTBELT_API_KEY ?? '';
        bot = new CoronaBot(new Textbelt(apiKey));

        config = {
            dutyRotationStart: new Date(Date.UTC(2020, 11, 1)),
            dutyDate: new Date(Date.UTC(2020, 11, 1)),
            dutyRotation: 4,
            recipients: [
                {
                    name: 'Big Homie Druhv',
                    phoneNumber: '5555555555',
                },
            ],
            bot,
        };
    });

    it('exits on rotation start + n * rotation', async () => {
        const res = await sendNoRonaMessage(config);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('status', 200);
        expect((res[0]['message'] ?? '').endsWith('you are 0')).toBeTruthy();
    });

    it('sends text to single recipient', async () => {
        const config2 = {
            ...config,
            dutyDate: new Date(Date.UTC(2020, 11, 3)),
        };
        const res = await sendNoRonaMessage(config2);

        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('status', 200);
        expect(res[0]).toHaveProperty('message.success', true);
    });
});

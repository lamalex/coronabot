import { AzureFunction, Context } from '@azure/functions';
import { DutyStatus, getDutyRotationStatus, CoronaBot } from '../nocorona';
import {
    SmsProvider,
    SmsRecipient,
    SmsResponse,
    Textbelt,
} from '../nocorona/smsservice';
import { zip } from '../nocorona/util';

const timerTrigger: AzureFunction = async function (
    context: Context,
    myTimer: any
) {
    const fiveAmLocalUTC = 11;
    const [year, month, day] = process.env['DUTY_DAY_INIT']
        .split('-')
        .map((n) => parseInt(n.trim()));

    const initalDutyDay = new Date(
        Date.UTC(year, month - 1, day, fiveAmLocalUTC)
    );

    const dutyRotation = parseInt(process.env['DUTY_ROTATION']);
    const today = new Date();
    const rotationStatusForToday = getDutyRotationStatus(
        initalDutyDay,
        today,
        dutyRotation
    );

    const apiKey = process.env['TEXTBELT_API_KEY'];
    const smsService = new Textbelt(apiKey);
    const coronaBot = new CoronaBot(smsService);

    const recipientNames = process.env['RECIPIENT_NAMES'].split(',');
    const recipientPhoneNumbers = process.env['RECIPIENT_PHONE_NUMBERS'].split(
        ','
    );

    const recipients = zip(recipientNames, recipientPhoneNumbers).map(
        ([name, phoneNumber]) => {
            return {
                name,
                phoneNumber,
            };
        }
    );

    const config: RonaConfig = {
        dutyRotationStart: initalDutyDay,
        dutyDate: today,
        dutyRotation,
        recipients,
        bot: coronaBot,
    };

    context.res.send(await sendNoRonaMessage(config));
};

export interface RonaConfig {
    dutyRotationStart: Date;
    dutyDate: Date;
    dutyRotation: number;
    recipients: SmsRecipient[];
    bot: CoronaBot;
}

export const sendNoRonaMessage = async (
    config: RonaConfig
): Promise<SmsResponse[]> => {
    const {
        dutyRotationStart,
        dutyDate,
        dutyRotation,
        recipients,
        bot,
    } = config;

    const rotationStatusForToday = getDutyRotationStatus(
        dutyRotationStart,
        dutyDate,
        dutyRotationStart
    );

    if (rotationStatusForToday != DutyStatus.Other) {
        console.debug(`Exiting: Not an off-duty day.`);
        return Promise.resolve([
            {
                status: 200,
                message: `On ${dutyDate} you are ${rotationStatusForToday}`,
            },
        ]);
    }

    const res = recipients.map(async (r) => {
        await bot.sendNoRona(r);
    });

    return await Promise.all(
        recipients.map(async (r) => {
            return await bot.sendNoRona(r);
        })
    );
};

export default timerTrigger;

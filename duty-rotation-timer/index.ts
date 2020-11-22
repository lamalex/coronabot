import 'dotenv/config';
import { AzureFunction, Context } from '@azure/functions';
import { DutyStatus, getDutyRotationStatus, CoronaBot } from '../nocorona';
import {
    SmsProvider,
    SmsRecipient,
    SmsResponse,
    Textbelt,
} from '../nocorona/smsservice';
import { RonaConfig, sendNoRonaMessage } from './execute';
import { zip } from './util';

const timerTrigger: AzureFunction = async function (
    context: Context,
    myTimer: any
) {
    const fiveAmLocalUTC = 11;
    const [year, month, day] = (process.env['DUTY_DAY_INIT'] ?? '')
        .split('-')
        .map((n) => {
            return parseInt(n.trim());
        });

    const initalDutyDay = new Date(
        Date.UTC(year, month - 1, day, fiveAmLocalUTC)
    );

    const dutyRotation = parseInt(process.env['DUTY_ROTATION'] ?? '4');
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

    const ronaMsgStatus = await sendNoRonaMessage(config);
    context.res?.send(ronaMsgStatus);
};

export default timerTrigger;

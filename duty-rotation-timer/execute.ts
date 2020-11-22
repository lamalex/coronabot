import { CoronaBot, DutyStatus, getDutyRotationStatus } from '../nocorona';
import { SmsRecipient, SmsResponse } from '../nocorona/smsservice';

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

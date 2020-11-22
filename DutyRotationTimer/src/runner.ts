import { Logger } from '@azure/functions'
import { DateTime } from 'luxon'
import { CoronaBot } from './coronabot'
import { DutyStatus, getDutyRotationStatus } from './dutystatus'
import { SmsRecipient, SmsResponse } from './messaging/sms'

export interface RonaConfig {
    dutyRotationStart: DateTime
    dutyDate: DateTime
    dutyRotation: number
    recipients: SmsRecipient[]
    bot: CoronaBot
    logger: Logger
}

export const sendNoRonaMessage = async (config: RonaConfig): Promise<SmsResponse[]> => {
    const { dutyRotationStart, dutyDate, dutyRotation, recipients, bot } = config

    const rotationStatusForToday = getDutyRotationStatus(dutyRotationStart, dutyDate, dutyRotation)
    if (rotationStatusForToday != DutyStatus.Other) {
        config.logger.info(`Exiting: Not an off-duty day (${rotationStatusForToday}).`)
        return Promise.resolve([
            {
                status: 200,
                message: `On ${dutyDate} you are ${rotationStatusForToday}`,
            },
        ])
    }

    return Promise.all(
        recipients.map(async (r) => {
            config.logger.info(`Sending message to ${r.name} (${r.phoneNumber})`)
            return bot.sendNoRona(r)
        })
    )
}

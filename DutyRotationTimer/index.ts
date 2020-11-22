import { DateTime } from 'luxon'
import { AzureFunction, Context } from '@azure/functions'
import { botFactory } from './src/coronabot'
import { RonaConfig, sendNoRonaMessage } from './src/runner'
import { zip } from './src/arrayutil'

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    const TURNOVER_TIME = 6
    const timezone = process.env['TIMEZONE'] || 'America/New_York'
    const dutyRotation = parseInt(process.env['DUTY_ROTATION'] || '4')

    const [year, month, day] = (process.env['DUTY_DAY_INIT'] ?? '').split('-').map((n) => {
        return parseInt(n)
    })

    if ([year, month, day].some(isNaN)) {
        context.log.error('DUTY_DAY_INIT was not set appropriately. Exiting')
        return
    }

    const initialDutyDay = DateTime.fromObject({
        year,
        month,
        day,
        hour: TURNOVER_TIME,
        zone: timezone,
    })

    const today = DateTime.fromObject({ hour: TURNOVER_TIME, zone: timezone })

    const recipientNames = (process.env['RECIPIENT_NAMES'] || '').split(',')
    const recipientPhoneNumbers = (process.env['RECIPIENT_PHONE_NUMBERS'] || '').split(',')

    const recipients = zip(recipientNames, recipientPhoneNumbers).map(([name, phoneNumber]) => {
        return {
            name,
            phoneNumber,
        }
    })

    const bot = botFactory(context.log.info)
    if (bot === null) {
        context.log.error('CoronaBot was not created. Verify a provider was able to be initialized')
        return
    }

    const config: RonaConfig = {
        dutyRotationStart: initialDutyDay,
        dutyDate: today,
        dutyRotation,
        recipients,
        bot,
        logger: context.log,
    }

    const res = await sendNoRonaMessage(config)
    context.log.info(res)
}
export default timerTrigger

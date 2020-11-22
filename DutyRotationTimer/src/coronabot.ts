import { providerFactory, SmsProvider, SmsRecipient, SmsResponse } from './messaging/sms'

export class CoronaBot {
    msgService: SmsProvider
    log: Function

    constructor(msgService: SmsProvider, log: Function = console.log) {
        this.msgService = msgService
        this.log = log
    }

    async sendNoRona(recipient: SmsRecipient): Promise<SmsResponse> {
        const msg = `${recipient.name} this is Launi. No Rona`
        this.log(`sending ${msg} to msg service`)
        return this.msgService.send(recipient, msg)
    }
}

export const botFactory = (log?: Function): CoronaBot | null => {
    let provider = providerFactory()
    return provider == null ? null : new CoronaBot(provider, log)
}

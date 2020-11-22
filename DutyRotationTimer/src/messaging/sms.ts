import axios from 'axios'

export interface SmsRecipient {
    name: string
    phoneNumber: string
}

export interface SmsResponse {
    status: number
    message?: string
}

export interface SmsProvider {
    send(recipient: SmsRecipient, message: string): Promise<SmsResponse>
}

export const providerFactory = (): SmsProvider | null => {
    const apiKey = process.env['TEXTBELT_API_KEY'] || ''
    return apiKey.length === 0 ? null : new Textbelt(apiKey)
}

export class Textbelt implements SmsProvider {
    apiEndpoint = 'https://textbelt.com/text'
    apiKey: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async send(recipient: SmsRecipient, message: string): Promise<SmsResponse> {
        const payload: TextbeltPayload = {
            phone: recipient.phoneNumber,
            key: this.apiKey,
            message: `${message}`,
        }

        return axios.post(this.apiEndpoint, payload).then((res) => {
            return {
                status: res.status,
                message: res.data,
            }
        })
    }
}

interface TextbeltPayload {
    phone: string
    key: string
    replyWebhookUrl?: string
    message: string
}

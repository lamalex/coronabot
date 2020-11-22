import axios from 'axios';

export interface SmsRecipient {
    name: string;
    phoneNumber: string;
}

export interface SmsResponse {
    status: number;
    message?: string;
}

export interface SmsProvider {
    send(recipient: SmsRecipient, message: string): Promise<SmsResponse>;
}

export class Textbelt implements SmsProvider {
    apiEndpoint = 'https://textbelt.com/text';
    apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    send(recipient: SmsRecipient, message: string): Promise<SmsResponse> {
        const payload: TextbeltPayload = {
            phone: recipient.phoneNumber,
            key: this.apiKey,
            message: `${message}`,
        };

        return axios.post(this.apiEndpoint, payload).then((res) => {
            return {
                status: res.status,
                message: res.data,
            };
        });
    }
}

interface TextbeltPayload {
    phone: string;
    key: string;
    replyWebhookUrl?: string;
    message: string;
}

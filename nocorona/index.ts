import axios from 'axios';
import { SmsProvider, SmsResponse, SmsRecipient } from './smsservice';

export enum DutyStatus {
    OnDuty = 0,
    OffGoing = 1,
    Other,
}

export const getDutyRotationStatus: Function = (
    rotationStart: Date,
    date: Date = new Date(),
    dutyCycle: number
): DutyStatus => {
    const cycleOffset =
        (((date.getTime() - rotationStart.getTime()) / 86400000) | 0) %
        dutyCycle;

    switch (cycleOffset) {
        case DutyStatus.OnDuty:
            return DutyStatus.OnDuty;
        case DutyStatus.OffGoing:
            return DutyStatus.OffGoing;
        default:
            return DutyStatus.Other;
    }
};

export class CoronaBot {
    smsService: SmsProvider;

    constructor(smsService: SmsProvider) {
        this.smsService = smsService;
    }

    async sendNoRona(recipient: SmsRecipient): Promise<SmsResponse> {
        const msg = `${recipient.name} this is Launi. No Rona`;
        return this.smsService.send(recipient, msg);
    }
}

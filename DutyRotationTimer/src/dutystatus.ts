import { DateTime, Interval } from 'luxon'

export enum DutyStatus {
    OnDuty = 0,
    OffGoing = 1,
    Other,
}

export const getDutyRotationStatus: Function = (
    rotationStart: DateTime,
    date: DateTime,
    dutyCycle: number
): DutyStatus => {
    const cycleOffset = (Interval.fromDateTimes(rotationStart, date).count('days') - 1) % dutyCycle

    switch (cycleOffset) {
        case DutyStatus.OnDuty:
            return DutyStatus.OnDuty
        case DutyStatus.OffGoing:
            return DutyStatus.OffGoing
        default:
            return DutyStatus.Other
    }
}

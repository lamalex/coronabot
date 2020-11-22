import { DateTime } from 'luxon'
import { DutyStatus, getDutyRotationStatus } from '../dutystatus'

const notABoundary = DateTime.fromObject({
    year: 2020,
    month: 11,
    day: 2,
    hour: 5,
    zone: 'America/New_York',
})
const endOfMonthBound = DateTime.fromObject({
    year: 2020,
    month: 11,
    day: 30,
    hour: 5,
    zone: 'America/New_York',
})
const endOfYearBound = DateTime.fromObject({
    year: 2020,
    month: 12,
    day: 31,
    hour: 5,
    zone: 'America/New_York',
})
const leapYearBound = DateTime.fromObject({
    year: 2020,
    month: 2,
    day: 25,
    hour: 5,
    zone: 'America/New_York',
})

describe.each`
    start
    ${notABoundary}
    ${endOfMonthBound}
    ${endOfYearBound}
    ${leapYearBound}
`('duty rotation status computation', ({ start }) => {
    let rotationCycle: number

    beforeEach(() => {
        rotationCycle = 4
    })

    it('says on-duty when start + (n * rotation) days from start', () => {
        const dateUnderTest = start.plus({ days: rotationCycle })

        const status = getDutyRotationStatus(start, dateUnderTest, rotationCycle)
        expect(status).toBe(DutyStatus.OnDuty)
    })

    it('says offgoing when start + (n * rotation + 1) days from start', () => {
        const dateUnderTest = start.plus({ days: rotationCycle + 1 })

        const status = getDutyRotationStatus(start, dateUnderTest, rotationCycle)
        expect(status).toBe(DutyStatus.OffGoing)
    })

    it('says neither on duty nor offgoing for start + (n * rotation + [2,...,rotation - 1]', () => {
        for (const i of Array.from(new Array(rotationCycle - 2), (x, i) => i + 2)) {
            const dateUnderTest = start.plus({ days: rotationCycle + i })

            const status = getDutyRotationStatus(start, dateUnderTest, rotationCycle)
            expect(status).toBe(DutyStatus.Other)
        }
    })
})

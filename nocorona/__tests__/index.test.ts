import { DutyStatus, getDutyRotationStatus } from '../index';

const notABoundary = new Date(Date.UTC(2020, 10, 2, 11));
const endOfMonthBound = new Date(Date.UTC(2020, 10, 30, 11));
const endOfYearBound = new Date(Date.UTC(2020, 11, 31, 11));
const leapYearBound = new Date(Date.UTC(2020, 1, 28, 11));

describe.each`
    start
    ${notABoundary}
    ${endOfMonthBound}
    ${endOfYearBound}
    ${leapYearBound}
`('duty rotation status computation', ({ start }) => {
    let rotationCycle: number;

    beforeEach(() => {
        rotationCycle = 4;
    });

    it('says on-duty when start + (n * rotation) days from start', () => {
        const dateUnderTest = new Date(start);
        dateUnderTest.setDate(start.getUTCDate() + rotationCycle);

        const status = getDutyRotationStatus(
            start,
            dateUnderTest,
            rotationCycle
        );
        expect(status).toBe(DutyStatus.OnDuty);
    });

    it('says offgoing when start + (n * rotation + 1) days from start', () => {
        const dateUnderTest = new Date(start);
        dateUnderTest.setDate(start.getUTCDate() + rotationCycle + 1);

        const status = getDutyRotationStatus(
            start,
            dateUnderTest,
            rotationCycle
        );
        expect(status).toBe(DutyStatus.OffGoing);
    });

    it('says neither on duty nor offgoing for start + (n * rotation + [2,...,rotation - 1]', () => {
        for (const i of Array.from(
            new Array(rotationCycle - 2),
            (x, i) => i + 2
        )) {
            const dateUnderTest = new Date(start);
            dateUnderTest.setDate(start.getUTCDate() + rotationCycle + i);

            const status = getDutyRotationStatus(
                start,
                dateUnderTest,
                rotationCycle
            );
            expect(status).toBe(DutyStatus.Other);
        }
    });
});

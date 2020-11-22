import { zip } from '../util';

describe('zip combines 2 arrays into an array of pairs', () => {
    it('merges lists of equal length', () => {
        const a = [1, 2, 3];
        const b = [4, 5, 6];

        expect(zip(a, b)).toEqual([
            [1, 4],
            [2, 5],
            [3, 6],
        ]);
    });

    it('merges lists when a is longer than b', () => {
        const a = [1, 2, 3];
        const b = [4, 5];

        expect(zip(a, b)).toEqual([
            [1, 4],
            [2, 5],
            [3, undefined],
        ]);
    });

    it('merges lists when b is longer than a', () => {
        const a = [1, 2];
        const b = [4, 5, 6];

        expect(zip(a, b)).toEqual([
            [1, 4],
            [2, 5],
            [undefined, 6],
        ]);
    });
});

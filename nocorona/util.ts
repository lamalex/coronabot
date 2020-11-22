export const zip = (a: any[], b: any[]): [any, any][] => {
    return a.length >= b.length
        ? a.map((item, i) => [item, b[i]])
        : b.map((item, i) => [a[i], item]);
};

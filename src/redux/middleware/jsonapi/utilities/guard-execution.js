const noop = () => {};

export default function(thenFunc, ifCondition) {
    if (typeof ifCondition === 'function') {
        return (...args) => ifCondition(...args) && thenFunc(...args);
    }

    return ifCondition ?
        thenFunc :
        noop;
}

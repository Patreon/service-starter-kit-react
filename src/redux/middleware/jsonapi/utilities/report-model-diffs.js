import last from 'lodash.last';
import { diff } from 'deep-diff';
import access from 'safe-access';


/* https://www.npmjs.com/package/deep-diff#differences */
const boundCb = (newModel, oldModel) => (memo, change) => {
    /* too noisy */
    if (change.kind === 'N') return memo;
    /* this should be undefined vs. null, won't overwrite.*/
    if (change.kind === 'D') return memo;
    /* modelRef changes within array, misleading diff */
    if (change.kind === 'E' && last(change.path) === 'id') return memo;

    const path = change.path.join('.');
    /* another misleading diff */
    if (change.kind === 'A' && change.item.kind !== 'N') {
        memo.push(`${oldModel.type}.${oldModel.id}.${path}: ` +
                `${JSON.stringify(access(oldModel, path))} --> ` +
                `${JSON.stringify(access(newModel, path))}`);
        return memo;
    }
    memo.push(`${oldModel.type}.${oldModel.id}.${path}: ` +
        `${JSON.stringify(change.lhs)} --> ${JSON.stringify(change.rhs)}`);
    return memo;
};

export default (resources, state) => {
    const accumulator = {
        noChange: [],
        changed: []
    };

    resources.reduce((memo, newModel) => {
        const { type, id } = newModel;
        const oldModel = state[type] ?
            state[type][id] :
            null;

        if (!newModel || !oldModel) return memo;

        const pickedOldModel = Object.keys(newModel).reduce((_memo, key) => {
            _memo[key] = oldModel[key];
            return _memo;
        }, {});

        const changeset = diff(pickedOldModel, newModel, (path, key) => (
            key === '_fetchedAt'
        ));

        if (!changeset || !changeset.length) {
            memo.noChange.push(`${oldModel.type}.${oldModel.id}`);
            return memo;
        }
        const parsedChangeset = changeset.reduce(boundCb(newModel, pickedOldModel), []);
        if (!parsedChangeset.length) return memo;
        memo.changed.push(parsedChangeset.join('\n'));
        return memo;
    }, accumulator);

    accumulator.noChange.sort();
    accumulator.changed.sort();

    if (accumulator.noChange.length) {
        console.groupCollapsed(`fetched at ${resources[0]._fetchedAt} NO CHANGE (${accumulator.noChange.length})`);
        accumulator.noChange.forEach((msg) => console.warn(msg));
        console.groupEnd();
    }
    if (accumulator.changed.length) {
        console.groupCollapsed(`fetched at ${resources[0]._fetchedAt}, CHANGED IN PLACE (${accumulator.changed.length})`);
        accumulator.changed.forEach((msg) => console.warn(msg));
        console.groupEnd();
    }
};

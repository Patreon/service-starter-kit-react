const extendModelsCb = (state) => (memo, resource) => {
    const { type, id, relationships } = resource;
    memo[type] = memo[type] || { ...state[type] };
    const oldModel = memo[type][id];
    const oldRelationships = oldModel ?
        oldModel.relationships :
        null;

    memo[type][id] = {
        ...oldModel,
        ...resource,
        relationships: {
            ...oldRelationships,
            ...relationships
        }
    };
    return memo;
};

export default (state, action) => {
    const { data, included, _fetchedAt } = action.meta.rawPayload;
    let resources = Array.isArray(data) ? data : [data];
    if (included) resources = resources.concat(included);
    if (process.env.NODE_ENV !== 'production') {
        const reportModelDiffs = require('../utilities/report-model-diffs');
        reportModelDiffs(resources, state);
    }

    const newState = {
        ...state,
        _fetchedAt
    };
    resources.reduce(extendModelsCb(state), newState);

    return newState;
};

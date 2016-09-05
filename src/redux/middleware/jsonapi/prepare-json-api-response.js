import { isRequestSuccess } from './action-types/request-action-types';
import denormalizedReducer from './reducers/denormalized';
import devError from './utilities/dev-error';
import mapOrCall from './utilities/map-or-call';
import access from 'safe-access';


const _makeRef = (model) => ({
    id: model.id,
    type: model.type
});

const _validateFetchedAt = (got, set, actionType) => {
    if (got === set) return;
    devError(console.error, `Race condition in data syncing between middleware and reducer at action ${actionType}!`);
};

let _lastFetchedAt = null;

export default store => next => action => {
    action.meta = action.meta || {};
    action.optimist = action.meta.optimist;
    const dataState = store.getState().data;
    const hasApiResources = isRequestSuccess(action.type) && access(action.payload, 'data');
    if (!hasApiResources) {
        action.meta.nextDataState = dataState;
        return next(action);
    }

    _validateFetchedAt(dataState._fetchedAt, _lastFetchedAt, action.type);

    action.meta.rawPayload = action.payload;
    const { meta, links, data, _fetchedAt } = action.meta.rawPayload;

    action.payload = mapOrCall(data, _makeRef);
    Object.assign(
        action.payload,
        {
            meta,
            links,
            /* setting action.payload._fetchedAt puts the property either on the single ref,
            or on the array holding multiple refs. */
            _fetchedAt
        }
    );

    _lastFetchedAt = _fetchedAt;
    /* Do this reducer work early so other reducers have access to the full dataset and
    can call getters on it. */
    action.meta.nextDataState = denormalizedReducer(dataState, action);

    next(action);
};

import { combineReducers } from 'redux';
import apiRequestAction from '../../middleware/jsonapi/api-request-action';
import requestActionTypes from '../../middleware/jsonapi/action-types/request-action-types';
import jsonApiUrl from '../../middleware/jsonapi/utilities/json-api-url';
import { makeRequestReducer } from '../../middleware/jsonapi/reducers/make-request-reducer';

export const LOAD = 'GET_FILTERED_WIDGETS';
const [_LOAD_REQUEST, _LOAD_SUCCESS, _LOAD_FAILURE] = requestActionTypes(LOAD);
export const LOAD_REQUEST = _LOAD_REQUEST;
export const LOAD_SUCCESS = _LOAD_SUCCESS;
export const LOAD_FAILURE = _LOAD_FAILURE;

const widgetSearchRefs = (state = null, action) => {
    switch (action.type) {
        case LOAD_REQUEST:
            return state;
        case LOAD_SUCCESS:
            return action.payload;
        case LOAD_FAILURE:
            return null;
        default:
            return state;
    }
};

const requests = combineReducers({
    [LOAD]: makeRequestReducer(LOAD)
});

const reducers = combineReducers({
    widgetSearchRefs,
    requests
});
export default reducers;

export function search(query) {
    if (query.length > 1) {
        return (dispatch, /* getState */) => {
            return dispatch(apiRequestAction(
                LOAD,
                jsonApiUrl(`/widget?filter[name]=:${query}`)
            ));
        };
    }
    return () => {};
}

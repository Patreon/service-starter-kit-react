import { combineReducers } from 'redux';
import apiRequestAction from '../../middleware/jsonapi/api-request-action';
import requestActionTypes from '../../middleware/jsonapi/action-types/request-action-types';
import jsonApiUrl from '../../middleware/jsonapi/utilities/json-api-url';
import { makeRequestReducer } from '../../middleware/jsonapi/reducers/make-request-reducer';

export const LOAD = 'GET_WIDGETS';
const [_LOAD_REQUEST, _LOAD_SUCCESS, _LOAD_FAILURE] = requestActionTypes(LOAD);
export const LOAD_REQUEST = _LOAD_REQUEST;
export const LOAD_SUCCESS = _LOAD_SUCCESS;
export const LOAD_FAILURE = _LOAD_FAILURE;

const requests = combineReducers({
    [LOAD]: makeRequestReducer(LOAD)
});

const reducers = combineReducers({
    requests
});
export default reducers;

export function load() {
    return (dispatch, /* getState */) => {
        return dispatch(apiRequestAction(
            LOAD,
            jsonApiUrl('/widget')
        ));
    };
}

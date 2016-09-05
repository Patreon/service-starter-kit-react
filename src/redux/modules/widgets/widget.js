import { combineReducers } from 'redux';
import apiRequestAction from '../../middleware/jsonapi/api-request-action';
import requestActionTypes from '../../middleware/jsonapi/action-types/request-action-types';
import jsonApiUrl from '../../middleware/jsonapi/utilities/json-api-url';
import { makeRequestReducer, makeMultiRequestReducer } from '../../middleware/jsonapi/reducers/make-request-reducer';


export const CLEAR_FOCUS = 'widget/CLEAR_FOCUS';

export const LOAD = 'GET_WIDGET';
const [_LOAD_REQUEST, _LOAD_SUCCESS, _LOAD_FAILURE] = requestActionTypes(LOAD);
export const LOAD_REQUEST = _LOAD_REQUEST;
export const LOAD_SUCCESS = _LOAD_SUCCESS;
export const LOAD_FAILURE = _LOAD_FAILURE;

export const CREATE = 'POST_WIDGET';
const [_CREATE_REQUEST, _CREATE_SUCCESS, _CREATE_FAILURE] = requestActionTypes(CREATE);
export const CREATE_REQUEST = _CREATE_REQUEST;
export const CREATE_SUCCESS = _CREATE_SUCCESS;
export const CREATE_FAILURE = _CREATE_FAILURE;

export const EDIT = 'PATCH_WIDGET';
const [_EDIT_REQUEST, _EDIT_SUCCESS, _EDIT_FAILURE] = requestActionTypes(EDIT);
export const EDIT_REQUEST = _EDIT_REQUEST;
export const EDIT_SUCCESS = _EDIT_SUCCESS;
export const EDIT_FAILURE = _EDIT_FAILURE;

const widgetRef = (state = null, action) => {
    switch (action.type) {
        case CLEAR_FOCUS:
            return null;
        case LOAD_REQUEST:
        case CREATE_REQUEST:
        case EDIT_REQUEST:
        case EDIT_FAILURE:
            return state;
        case LOAD_SUCCESS:
        case CREATE_SUCCESS:
        case EDIT_SUCCESS:
            return action.payload;
        case LOAD_FAILURE:
        case CREATE_FAILURE:
            return null;
        default:
            return state;
    }
};

const requests = combineReducers({
    [LOAD]: makeMultiRequestReducer(LOAD),
    [CREATE]: makeRequestReducer(CREATE),
    [EDIT]: makeMultiRequestReducer(EDIT)
});

const reducers = combineReducers({
    widgetRef,
    requests
});
export default reducers;

export function clearFocus() {
    return {
        type: CLEAR_FOCUS
    };
}

export function load(widgetID) {
    return (dispatch, /* getState */) => {
        return dispatch(apiRequestAction(
            LOAD,
            jsonApiUrl(`/widget/${widgetID}`, {
                fields: {widget: ['name', 'description', 'created_at']}
            })
        ));
    };
}

export function saveWidget(widgetID, name, description) {
    return (dispatch, /* getState */) => {
        return dispatch(apiRequestAction(
            EDIT,
            jsonApiUrl(`/widget/${widgetID}`, {
                fields: {widget: ['name', 'description', 'created_at']}
            }),
            {
                body: {
                    data: {
                        type: 'widget',
                        attributes: {
                            name,
                            description
                        }
                    }
                }
            }
        ));
    };
}

export function createWidget(name, description) {
    return (dispatch, /* getState */) => {
        return dispatch(apiRequestAction(
            CREATE,
            jsonApiUrl(`/widget`, {
                fields: {widget: ['name', 'description', 'created_at']}
            }),
            {
                body: {
                    data: {
                        type: 'widget',
                        attributes: {
                            name,
                            description
                        }
                    }
                }
            }
        ));
    };
}

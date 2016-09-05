import { combineReducers } from 'redux';
import requestActionTypes from '../action-types/request-action-types';


const _validateRequestActions = (requestActionType, successActionType, failureActionType) => {
    if (!requestActionType.endsWith('REQUEST') ||
        !successActionType.endsWith('SUCCESS') ||
        !failureActionType.endsWith('FAILURE')) {
        throw new Error(`requestActionTypes should be listed in order and end in 'REQUEST', 'SUCCESS', and 'FAILURE'.`);
    }
};

const makeRequestPendingReducer = ([requestActionType, successActionType, failureActionType], resetActionType) => {
    // _validateRequestActions(requestActionType, successActionType, failureActionType)

    return (state = false, action) => {
        if (resetActionType && action.type === resetActionType) return false;

        switch (action.type) {
            case successActionType:
                return false;
            case failureActionType:
                return false;
            case requestActionType:
                return action.error
                    ? false
                    : true;
            default:
                return state;
        }
    };
};

const makeRequestErrorReducer = ([requestActionType, successActionType, failureActionType], resetActionType) => {
    // _validateRequestActions(requestActionType, successActionType, failureActionType)

    return (state = null, action) => {
        if (resetActionType && action.type === resetActionType) return null;

        switch (action.type) {
            case successActionType:
                return null;
            case failureActionType:
                return action.payload;
            case requestActionType:
                return action.error
                ? action.payload
                : state;
            default:
                return state;
        }
    };
};

export const makeRequestReducer = (actionTypeOrOptions) => {
    const { actionType, resetActionType } = typeof actionTypeOrOptions === 'string'
        ? { actionType: actionTypeOrOptions }
        : actionTypeOrOptions;

    const builtRequestActionTypes = requestActionTypes(actionType);
    _validateRequestActions(...builtRequestActionTypes);

    return combineReducers({
        pending: makeRequestPendingReducer(builtRequestActionTypes, resetActionType),
        error: makeRequestErrorReducer(builtRequestActionTypes, resetActionType)
    });
};

export const makeMultiRequestReducer = (actionType) => {
    const requestReducer = makeRequestReducer(actionType);

    return (state = {}, action) => (
        (requestActionTypes(actionType).indexOf(action.type) === -1) ?
            state :
            {
                ...state,
                [action.meta.actionKey]: requestReducer(state[action.meta.actionKey], action)
            }
    );
};

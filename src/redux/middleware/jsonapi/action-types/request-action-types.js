import { getJSON } from 'redux-api-middleware';
import parseJsonApiResponse from '../utilities/parse-json-api-response';
import memoize from 'lodash.memoize';

const REQUEST_START_SUFFIX = '_JSONAPI_REQUEST';
const REQUEST_SUCCESS_SUFFIX = '_JSONAPI_SUCCESS';
const REQUEST_FAILURE_SUFFIX = '_JSONAPI_FAILURE';

export const isRequestStart = (requestActionType) => {
    if (typeof requestActionType !== 'string') {
        return false;
    }
    return requestActionType.endsWith(REQUEST_START_SUFFIX);
};
export const isRequestSuccess = (requestActionType) => {
    if (typeof requestActionType !== 'string') {
        return false;
    }
    return requestActionType.endsWith(REQUEST_SUCCESS_SUFFIX);
};

const requestActionTypes = memoize( (actionType) => ([
    `${actionType}${REQUEST_START_SUFFIX}`,
    `${actionType}${REQUEST_SUCCESS_SUFFIX}`,
    `${actionType}${REQUEST_FAILURE_SUFFIX}`
]) );
export default requestActionTypes;

export const requestActionHandlers = (actionType, actionKey, transformSuccess) => {
    const builtRequestActionTypes = requestActionTypes(actionType);

    const payload = transformSuccess ?
    (action, state, res) =>
        getJSON(res)
        .then(parseJsonApiResponse)
        .then(parsedJson => transformSuccess(action, state, parsedJson)) :
    (action, state, res) => getJSON(res).then(parseJsonApiResponse);

    const descriptors = [
        {
            type: builtRequestActionTypes[0]
        },
        {
            type: builtRequestActionTypes[1],
            payload
        },
        {
            type: builtRequestActionTypes[2]
        }
    ];

    return actionKey ?
        descriptors.map((descriptor) => ({
            ...descriptor,
            meta: {
                ...descriptor.meta,
                actionKey
            }
        })) :
        descriptors;
};

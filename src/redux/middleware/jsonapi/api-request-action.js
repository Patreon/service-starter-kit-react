import { CALL_API } from 'redux-api-middleware';
import { requestActionHandlers } from './action-types/request-action-types';
import bailoutIfPendingFn from './bailout-if-pending-fn';


export default (actionTypeAndKey, endpoint, options) => {
    const [actionType, immutActionKey] = actionTypeAndKey.split('__');
    let actionKey = immutActionKey;

    // TODO: deprecate this magic if actions aren't relying on it.
    if (!actionKey) {
        const idInRoute = endpoint.match(/(\/)([0-9]+)/);
        actionKey = idInRoute ? idInRoute[2] : null;
    }

    /* see https://github.com/agraboso/redux-api-middleware#usage */
    const request = {
        endpoint,
        method: actionType.split('_')[0],
        credentials: 'same-origin',
        types: requestActionHandlers(actionType, actionKey),
        bailout: bailoutIfPendingFn(actionType, actionKey),
        headers: { 'Content-Type': 'application/json' }
    };

    if (options) Object.assign(request, options);

    if (request.body) request.body = JSON.stringify(request.body);

    return {
        [CALL_API]: request
    };
};

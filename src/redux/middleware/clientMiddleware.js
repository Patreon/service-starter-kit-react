import { CALL_API } from 'redux-api-middleware';

export default function clientMiddleware(client) {
    return ({dispatch, getState}) => {
        return next => action => {
            if (typeof action === 'function') {
                return action(dispatch, getState);
            }

            const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
            if (!promise) {
                if (action[CALL_API] && __SERVER__ && client.req && client.req.get('cookie')) {
                    const headers = {
                        ...action[CALL_API].headers,
                        'Cookie': client.req.get('cookie')
                    };
                    action[CALL_API] = {
                        ...action[CALL_API],
                        headers
                    };
                }
                return next(action);
            }

            const [REQUEST, SUCCESS, FAILURE] = types;
            next({...rest, type: REQUEST});

            const actionPromise = promise(client);
            actionPromise.then(
                (result) => next({...rest, result, type: SUCCESS}),
                (error) => next({...rest, error, type: FAILURE})
            ).catch((error)=> {
                console.error('MIDDLEWARE ERROR:', error);
                next({...rest, error, type: FAILURE});
            });

            return actionPromise;
        };
    };
}

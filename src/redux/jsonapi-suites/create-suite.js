import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import apiRequestAction from '../middleware/jsonapi/api-request-action';
import requestActionTypes from '../middleware/jsonapi/action-types/request-action-types';
import { makeRequestReducer, makeMultiRequestReducer } from '../middleware/jsonapi/reducers/make-request-reducer';
import access from 'safe-access';

// utility function so that ES7 is not required
const _objectWithoutProperties = (obj, keys) => {
    const target = {};
    for (const key in obj) {
        if (keys.indexOf(key) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        target[key] = obj[key];
    }
    return target;
};


/*
    # Create the requisite actions, reducers, and selectors for a given API request and the resources it influences.

    ## Input
    actionType:
        The primary API action as an enum string.
        As with middleware/jsonapi/api-request-action, the prefix determines the HTTP method.
    requestGenerator:
        A function that takes arbitrary arguments and returns the URL and request options (e.g., body) that those arguments would indicate.
        You will be passing these arguments in later, a la: `dispatch({your created suite}.requestAction({your args}))`

    ## Output
    {
        requestAction: <function which takes arguments to craft the details of an API call, then triggers it>,
        clearAction: <function which clears this suite's state>,
        actionTypes: {
            ROOT: <the provided actionType>,
            REQUEST: <string representing the action which triggers the API call>,
            SUCCESS: <string representing the action results upon API call success>,
            FAILURE: <string representing the action results upon API call failure>,
            CLEAR_REF: <string representing the action which clears this suite's state>,
        },
        reducers: <combined reducers you can pass to your parent combineReducers() call>,
        selector: <function which outputs our JSONAPI-Model shape>
    }

    ## JSONAPI-Model shape
    {
        requests: { <key a la makeMultiRequestReducer>: { pending: <bool>, error: <error object> }, ... },
        links: <links returned a la http://jsonapi.org/format/#document-links>,
        resources: [{type, id}, ...]
    }

    ## Typical usage
    ```models/widget.js
    import jsonApiUrl from '../middleware/jsonapi/utilities/json-api-url';
    import createSuite from './create-jsonapi-suite';

    export const widgetLoadSuite = createSuite(
        'GET_WIDGET',
        (widgetID) => ({
            url: jsonApiUrl(`/widget/${widgetID}`)
        })
    );

    ...
    ```

    ```containers/WidgetView/WidgetView.js
    ...
    import {widgetLoadSuite} from 'models/widget';

    @asyncConnect([{
        promise: ({store: {dispatch}, params}) => {
            return dispatch(widgetLoadSuite.requestAction(params.widgetID));
        }
    }])
    @connect(
        (state, ownProps) => ({ widgetRef: widgetLoadSuite.selector(state) })
    )
    export default class WidgetView extends Component {
        static propTypes = {
            widgetRef: React.PropTypes.shape({
                requests: PropTypes.object,
                links: PropTypes.object,
                resources: PropTypes.array
            }),
        }

        ...
    }
    ```

    ```containers/WidgetView/reducers.js
    import {combineReducers} from 'redux';
    import {routerReducer} from 'react-router-redux';
    import {reducer as reduxAsyncConnect} from 'redux-async-connect';
    ...
    import {widgetLoadSuite} from 'models/widget';

    export const combinedReducers = combineReducers({
        routing: routerReducer,
        reduxAsyncConnect,
        ...
        suites: combineReducers({
            [widgetLoadSuite.actionTypes.ROOT]: widgetLoadSuite.reducers,
            ...
        })
    });
    export default combinedReducers;
    ```
 */

export default (actionType, requestGenerator, multiRequest = true) => {
    // action
    const coreRequestAction = (...args) => {
        const allOptions = requestGenerator(...args);
        if (!allOptions.url) {
            return undefined;
        }
        const options = _objectWithoutProperties(allOptions, ['url']);
        return (dispatch, /* getState */) => {
            return dispatch(apiRequestAction(
                actionType,
                allOptions.url,
                options
            ));
        };
    };

    // action types
    const [REQUEST, SUCCESS, FAILURE] = requestActionTypes(actionType);
    const CLEAR_REF = `CLEAR_REF_${actionType}`;
    const actionTypes = {ROOT: actionType, REQUEST, SUCCESS, FAILURE, CLEAR_REF};

    // reducers
    const resourcesReducer = (state = null, action) => {
        switch (action.type) {
            case SUCCESS:
                return action.payload;
            case FAILURE:
            case CLEAR_REF:
                return null;
            case REQUEST:
            default:
                return state;
        }
    };
    const reducers = combineReducers({
        resources: resourcesReducer,
        requests: multiRequest ? makeMultiRequestReducer(actionType) : makeRequestReducer(actionType),
    });

    // selector
    const requestsSelector = (state) => access(state, `suites.${actionType}.requests`);
    const linksSelector = (state) => access(state, `suites.${actionType}.resources.links`);
    const resourcesSelector = (state) => {
        const maybeResources = access(state, `suites.${actionType}.resources`);
        if (!maybeResources) {
            return null;
        }
        const resources = Array.isArray(maybeResources) ? maybeResources : [maybeResources];
        return resources.map((resource) => access(state, `data.${resource.type}.${resource.id}`));
    };
    const selector = createSelector(
        [requestsSelector, linksSelector, resourcesSelector],
        (requests, links, resources) => ({
            requests,
            links,
            resources,
        })
    );

    return {
        requestAction: coreRequestAction,
        clearAction: () => ({ type: CLEAR_REF }),
        actionTypes,
        reducers,
        selector
    };
};

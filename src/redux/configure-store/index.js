import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'; // eslint-disable-line camelcase
import { batchedSubscribe } from 'redux-batched-subscribe';
import optimist from 'redux-optimist';
import thunkMiddleware from 'redux-thunk';
import { apiMiddleware } from 'redux-api-middleware';
import isPlainObject from 'is-plain-object';

// import csrfTicketMiddleware from 'shared/middleware/csrf-ticket';
import configureNion from 'libs/nion/configure';

const defaultOptions = {
    responsive: true,
    optimistic: false,
    nion: true
};

export const baseMiddleware = [
    // csrfTicketMiddleware,
    thunkMiddleware
];

export default function configureStore(
    reducers,
    { responsive, data, optimistic, nion } = defaultOptions,
    extraMiddleware = null,
    initialState = {}
) {
    if (!isPlainObject(reducers)) {
        console.error('reducers passed to configureStore must be a plain object.');
    }

    // const configuredReducers = reducers;
    let configuredReducers = reducers;
    let middleware = [...baseMiddleware];

    if (nion) {
        const nionConfig = configureNion();
        configuredReducers = { ...configuredReducers, nion: nionConfig.reducer };
    }

    if (extraMiddleware) middleware = [ ...middleware, ...extraMiddleware, apiMiddleware ];

    let finalCreateStore;
    if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
        const { persistState } = require('redux-devtools');
        const DevTools = require('../../containers/DevTools/DevTools');
        finalCreateStore = compose(
            applyMiddleware(...middleware),
            window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
            persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
        )(createStore);
    } else {
        finalCreateStore = compose(
            applyMiddleware(...middleware),
            batchedSubscribe(batchedUpdates)
        )(createStore);
    }

    const customRootReducer = configuredReducers._root;
    if (customRootReducer) {
        delete configuredReducers._root;
    }
    const combinedReducers = combineReducers(configuredReducers);
    let finalReducers = combinedReducers;
    if (customRootReducer) {
        finalReducers = (state = null, action) => {
            const mainResult = combinedReducers(state, action);
            const wrappedResult = customRootReducer(mainResult, action);
            return wrappedResult;
        };
    }
    if (optimistic) finalReducers = optimist(finalReducers);

    const store = finalCreateStore(
        finalReducers,
        initialState
    );

    return store;
}

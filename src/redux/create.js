import createMiddleware from './middleware/clientMiddleware';
import { routerMiddleware } from 'react-router-redux';
import configureStore from './configure-store';

export default function createStore(history, client, data) {
    // Sync dispatched route actions to the history
    const reduxRouterMiddleware = routerMiddleware(history);

    const middleware = [createMiddleware(client), reduxRouterMiddleware];

    const { reducers } = require('./modules/reducer');
    const store = configureStore(reducers, undefined, middleware, data);

    if (__DEVELOPMENT__ && module.hot) {
        module.hot.accept('./modules/reducer', () => {
            store.replaceReducer(require('./modules/reducer').default);
        });
    }

    return store;
}

import { combineReducers } from 'redux';
// import multireducer from 'multireducer';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import auth from './auth';
import {reducer as form} from 'redux-form';
import widget from './widgets/widget';
import widgetsList from './widgets/widgets-list';
import widgetSearch from './widgets/widget-search';

export const reducers = {
    routing: routerReducer,
    reduxAsyncConnect,
    auth,
    form,
    // multireducer: multireducer({
    //     counter1: counter,
    //     counter2: counter,
    //     counter3: counter
    // }),
    widget,
    widgetsList,
    widgetSearch,
};

export const combinedReducers = combineReducers(reducers);

export default combinedReducers;

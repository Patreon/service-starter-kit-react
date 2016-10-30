import { combineReducers } from 'redux';
// import multireducer from 'multireducer';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import auth from './auth';
import {reducer as form} from 'redux-form';
import {
    widgetLoadSuite,
    widgetListSuite,
    widgetSearchSuite,
    widgetEditSuite,
    widgetCreateSuite,
} from './widget';

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
    suites: combineReducers({
        [widgetLoadSuite.actionTypes.ROOT]: widgetLoadSuite.reducers,
        [widgetListSuite.actionTypes.ROOT]: widgetListSuite.reducers,
        [widgetSearchSuite.actionTypes.ROOT]: widgetSearchSuite.reducers,
        [widgetEditSuite.actionTypes.ROOT]: widgetEditSuite.reducers,
        [widgetCreateSuite.actionTypes.ROOT]: widgetCreateSuite.reducers,
    }),
};

export const combinedReducers = combineReducers(reducers);

export default combinedReducers;

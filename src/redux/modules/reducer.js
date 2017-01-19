import { combineReducers } from 'redux';
// import multireducer from 'multireducer';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import auth from './auth';
import {reducer as form} from 'redux-form';

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
};

export const combinedReducers = combineReducers(reducers);

export default combinedReducers;

import React from 'react';
import {IndexRoute, Route} from 'react-router';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import {
    App,
    Chat,
    Home,
    About,
    Login,
    LoginSuccess,
    Survey,
    NotFound,
    WidgetPage,
    AdminPanel,
    WidgetsList,
    WidgetEditor,
} from 'containers';

export default (store) => {
    const requireLogin = (nextState, replace, cb) => {
        function checkAuth() {
            const { auth: { user }} = store.getState();
            if (!user) {
                // oops, not logged in, so can't be here!
                replace('/');
            }
            cb();
        }

        if (!isAuthLoaded(store.getState())) {
            store.dispatch(loadAuth()).then(checkAuth);
        } else {
            checkAuth();
        }
    };

    const requireAdmin = (nextState, replace, cb) => {
        function checkAdmin() {
            const { auth: { user }} = store.getState();
            if (!(user && user.attributes && user.attributes.is_admin)) {
                // oops, not a logged-in admin, so can't be here!
                replace('/');
            } else {
                console.log('user is admin!');
            }
            cb();
        }

        if (!isAuthLoaded(store.getState())) {
            store.dispatch(loadAuth()).then(checkAdmin);
        } else {
            checkAdmin();
        }
    };

    /**
    * Please keep routes in alphabetical order
    */
    return (
        <Route path="/" component={App}>
            { /* Home (main) route */ }
            <IndexRoute component={Home}/>

            { /* Routes requiring login */ }
            <Route onEnter={requireLogin}>
                <Route path="chat" component={Chat}/>
                <Route path="loginSuccess" component={LoginSuccess}/>

                { /* Admin Routes */ }
                <Route onEnter={requireAdmin}>
                    <Route path="admin" component={AdminPanel}/>
                    <Route path="admin/widgets/new" component={WidgetEditor}/>
                    <Route path="admin/widgets/:widgetID/edit" component={WidgetEditor}/>
                </Route>
            </Route>

            { /* Routes */ }
            <Route path="about" component={About}/>
            <Route path="login" component={Login}/>
            <Route path="survey" component={Survey}/>

            <Route path="widgets" component={WidgetsList}/>
            <Route path="widgets/:widgetID" component={WidgetPage}/>

            { /* Catch all route */ }
            <Route path="*" component={NotFound} status={404} />
        </Route>
    );
};

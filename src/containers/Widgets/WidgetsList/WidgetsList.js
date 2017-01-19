import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import values from 'lodash.values';
import access from 'safe-access';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import { widgetListAction } from 'redux/modules/widget';
import { selectData, selectRequest } from 'libs/nion';

const DATA_KEY = 'WidgetsList';

@asyncConnect([{
    promise: ({store: {dispatch, getState}}) => {
        const promises = [];

        const state = getState();
        if (!isAuthLoaded(state)) {
            promises.push(dispatch(loadAuth()));
        }
        promises.push(dispatch(widgetListAction(DATA_KEY)()));
        return Promise.all(promises);
    }
}])
@connect(
    (state) => {
        const rawWidgets = access(state, 'nion.entities') ? values(state.nion.entities.widget) : [];
        const normalizedWidgets = rawWidgets.map((rawWidget) => (selectData(rawWidget)(state)));
        return {
            currentUser: state.auth.user,
            widgets: normalizedWidgets,
            widgetsLoaded: access(selectRequest(DATA_KEY)(state), 'status') !== 'pending'
        };
    },
    {}
)
export default class WidgetsList extends Component {
    static propTypes = {
        currentUser: PropTypes.object,
        widgets: PropTypes.array,
        widgetsLoaded: PropTypes.bool
    }

    render() {
        return (
            <div className="container">
                <h1>Widgets</h1>
                <Helmet title="Widgets"/>

                {access(this.props, 'currentUser.attributes.is_admin') && (
                    <div>
                        <Link to="/admin/widgets/new">
                            <div>New Widget</div>
                        </Link>
                        <br />
                    </div>
                )}
                {this.props.widgets && this.props.widgets.length > 0 ? (
                    <div>
                        <ul>
                            {this.props.widgets.map((widget) => (
                                <li key={widget.id}>
                                    <Link to={'/widgets/' + widget.id}>
                                        <div>{widget.name}</div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>
                        No widgets made!
                    </div>
                )}
                {!this.props.widgetsLoaded && (
                    <div>
                        Loading widgets...
                    </div>
                )}
            </div>
        );
    }
}

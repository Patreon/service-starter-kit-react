import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Grid, Row, Col} from 'react-bootstrap';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import access from 'safe-access';
import { selectData, selectRequest } from 'libs/nion';
import { widgetLoadAction } from 'redux/modules/widget';

const DATA_KEY = 'WidgetPage';

@asyncConnect([{
    promise: ({store: {dispatch, getState}, params}) => {
        const promises = [];

        const state = getState();
        if (!isAuthLoaded(state)) {
            promises.push(dispatch(loadAuth()));
        }
        if (params.widgetID) {
            promises.push(dispatch(widgetLoadAction(DATA_KEY)(params.widgetID)));
        }

        return Promise.all(promises);
    }
}])
@connect(
    (state) => {
        const widget = selectData(DATA_KEY)(state);
        const widgetRequest = selectRequest(DATA_KEY)(state);
        return {
            currentUser: state.auth.user,
            widget: widget,
            widgetLoaded: widgetRequest.status !== 'pending',
        };
    }
)
export default class WidgetPage extends Component {
    static propTypes = {
        params: React.PropTypes.shape({
            widgetID: PropTypes.string.isRequired
        }),
        currentUser: PropTypes.object,
        widget: PropTypes.object,
        widgetLoaded: PropTypes.bool.isRequired
    }

    render() {
        if (!this.props.widgetLoaded) {
            return (
                <div className="container">
                    <Helmet title="Widget"/>
                    <h1>Widget</h1>

                    <p>Loading widget...</p>
                </div>
            );
        } else if (!this.props.widget) {
            return (
                <div className="container">
                    <Helmet title="Widget"/>
                    <h1>Widget: Error</h1>

                    <p>Widget not found!</p>
                </div>
            );
        }
        return (
            <div className="container">
                <Helmet title={this.props.widget.name + ' Widget'} />

                <Grid>
                    <Row>
                        <Col xs={12} md={4} mdPush={8}>
                            {access(this.props, 'currentUser.attributes.is_admin') && (
                                <Link to={`/admin/widgets/${this.props.widget.id}/edit`}>
                                    <button className="btn">Edit Widget</button>
                                </Link>
                            )}
                        </Col>
                        <Col xs={12} md={8} mdPull={4}>
                            <h1>{this.props.widget.name}</h1>
                        </Col>
                    </Row>
                    <p dangerouslySetInnerHTML={{__html: this.props.widget.description}} />
                </Grid>
            </div>
        );
    }
}

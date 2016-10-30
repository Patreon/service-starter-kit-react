import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Grid, Row, Col} from 'react-bootstrap';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import access from 'safe-access';
import {widgetLoadSuite} from 'redux/modules/widget';

@asyncConnect([{
    promise: ({store: {dispatch, getState}, params}) => {
        const promises = [];

        const state = getState();
        if (!isAuthLoaded(state)) {
            promises.push(dispatch(loadAuth()));
        }
        const widgetRef = widgetLoadSuite.selector(state);
        const loadedWidgetID = access(widgetRef, 'resources[0].id');
        if (loadedWidgetID && params.widgetID && (loadedWidgetID.toString() !== params.widgetID.toString())) {
            promises.push(dispatch(widgetLoadSuite.clearAction()));
        }
        if (params.widgetID) {
            promises.push(dispatch(widgetLoadSuite.requestAction(params.widgetID)));
        }

        return Promise.all(promises);
    }
}])
@connect(
    (state, ownProps) => {
        const widgetRef = widgetLoadSuite.selector(state);
        return {
            currentUser: state.auth.user,
            widget: widgetRef.resources ? widgetRef.resources[0] : null,
            widgetLoaded: !access(widgetRef.requests, `${ownProps.params.widgetID}.pending`)
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
        return this.props.widgetLoaded ? (
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
        ) : (
            <div className="container">
                <Helmet title="Widget"/>
                <h1>Widget</h1>

                <p>Loading widget...</p>
            </div>
        );
    }
}

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Grid, Row, Col} from 'react-bootstrap';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import * as widgetActions from 'redux/modules/widgets/widget';
import access from 'safe-access';

@asyncConnect([{
    promise: ({store: {dispatch, getState}, params}) => {
        const promises = [];

        const state = getState();
        if (!isAuthLoaded(state)) {
            promises.push(dispatch(loadAuth()));
        }
        const widgetID = params.widgetID;
        if (access(state, 'widget.widgetRef.id')
        && access(state, 'widget.widgetRef.id').toString() !== params.widgetID) {
            promises.push(dispatch(widgetActions.clearFocus()));
        }
        if (widgetID) {
            promises.push(dispatch(widgetActions.load(widgetID)));
        }

        return Promise.all(promises);
    }
}])
@connect(
    (state, ownProps) => ({
        currentUser: state.auth.user,
        widget: access(state, 'data.widget') && access(state, 'widget.widgetRef.id') ? state.data.widget[state.widget.widgetRef.id] : undefined,
        widgetLoaded: !access(state, `widget.requests.${widgetActions.LOAD}.${ownProps.params.widgetID}.pending`)
    }),
    widgetActions
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

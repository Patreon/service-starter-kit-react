import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { push } from 'react-router-redux';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import { selectData, selectRequest } from 'libs/nion';
import {ContentDescriptionEditor, /* MultiSelectWithSearch */} from 'components';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import {
    widgetLoadAction,
    widgetCreateAction,
    widgetEditAction,
    widgetDeleteAction,
} from 'redux/modules/widget';
// import * as multiselectRelationSearchActions from 'redux/modules/multiselectRelations/multiselectRelation-search';
import access from 'safe-access';

const DATA_KEY = 'WidgetEditor';

// const multiselectRelationSearchResultsSelector = (state) => {
//     if (access(state, 'data.multiselectRelation') && access(state, 'multiselectRelationSearch.multiselectRelationSearchRefs')) {
//         return state.multiselectRelationSearch.multiselectRelationSearchRefs.map((multiselectRelationRef) => (
//             state.data.multiselectRelation[multiselectRelationRef.id]
//         ));
//     }
//     return [];
// };

@asyncConnect([{
    promise: ({store: {dispatch, getState}, params}) => {
        const promises = [];

        const state = getState();
        if (!isAuthLoaded(state)) {
            promises.push(dispatch(loadAuth()));
        }
        const widgetID = params.widgetID;
        if (widgetID) {
            promises.push(dispatch(widgetLoadAction(DATA_KEY)(widgetID)));
        }

        return Promise.all(promises);
    }
}])
@connect(
    (state, ownProps) => {
        const createMode = typeof access(ownProps, 'params.widgetID') === 'undefined';
        const requestState = selectRequest(DATA_KEY)(state);
        return {
            createMode,
            widget: createMode ? null : selectData(DATA_KEY)(state),
            requestState
        };
    },
    {
        createWidget: widgetCreateAction(DATA_KEY),
        saveWidget: widgetEditAction(DATA_KEY),
        deleteWidget: widgetDeleteAction(DATA_KEY),
        pushState: push
    }
)
export default class WidgetEditor extends Component {
    static propTypes = {
        params: React.PropTypes.shape({
            widgetID: PropTypes.string
        }),
        createMode: PropTypes.bool.isRequired,
        widget: PropTypes.object,
        requestState: PropTypes.object,
        createWidget: PropTypes.func.isRequired,
        saveWidget: PropTypes.func.isRequired,
        deleteWidget: PropTypes.func.isRequired,
        pushState: PropTypes.func.isRequired,

        // multiselectRelationSearchResults: PropTypes.array,
        // search: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            isDeleting: false
        };
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const name = this.refs.nameField.value;
        const descriptionHTML = this.refs.descriptionEditor.state.value ?
        this.refs.descriptionEditor.state.value.toString('html') : undefined;
        // const selectedMultiselectRelationsAsRefs = this.refs.multiSelectWithSearch.state.selectedValues.map((multiselectRelation) => ({
        //     type: multiselectRelation.type,
        //     id: multiselectRelation.id
        // }));
        if (this.props.createMode) {
            this.props.createWidget(name, descriptionHTML, /* selectedMultiselectRelationsAsRefs */)
                .then((response) => {
                    const createdWidget = access(response, 'payload.newRequestRef.entities[0]');
                    const destination = createdWidget ? `/widgets/${createdWidget.id}` : '/widgets';
                    this.props.pushState(destination);
                });
        } else {
            this.props.saveWidget(this.props.widget.id, name, descriptionHTML, /* selectedMultiselectRelationsAsRefs */)
                .then(() => {
                    this.props.pushState(`/widgets/${this.props.widget.id}`);
                });
        }
    }

    handleDelete = (event) => {
        event.preventDefault();
        this.setState({isDeleting: true});
        if (confirm('Delete the item?')) {
            this.props.deleteWidget(this.props.widget.id)
                .then(() => {
                    this.props.pushState(`/widgets`);
                });
        }
    }

    render() {
        const isLoading = access(this.props, 'requestState.isLoading');
        return (
            <div className="container">
                {this.props.createMode ? (
                    <div>
                        <h1>Create New Widget</h1>
                        <Helmet title="Create New Widget"/>
                    </div>
                ) : (
                    <div>
                        <h1>Edit Widget</h1>
                        <Helmet title="Edit Widget"/>
                    </div>
                )}

                <div>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <input type="text" ref="nameField" placeholder="Widget name" className="form-control"
                                defaultValue={access(this.props.widget, 'name')} />
                        </div>
                        <div className="form-group">
                            <ContentDescriptionEditor ref="descriptionEditor"
                                defaultValue={access(this.props.widget, 'description')} />
                        </div>
                        {/* <div className="form-group">
                            <MultiSelectWithSearch ref="multiSelectWithSearch"
                                onSearchChange={this.props.search}
                                searchRsesults={this.props.multiselectRelationSearchResults}
                                selectedItems={access(this.props.widget, 'multiselectRelations')} />
                        </div> */}
                        <button className="btn btn-success" onClick={!isLoading ? this.handleSubmit : null}>
                            {isLoading && !this.state.isDeleting ? 'Saving...' : 'Save'}
                        </button>
                    </form>
                </div>
                {this.props.widget ? (
                    <div style={{paddingTop: '1em'}}>
                        <button className="btn btn-danger" onClick={!isLoading ? this.handleDelete : null}>
                            {isLoading && this.state.isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                ) : null}
            </div>
        );
    }
}

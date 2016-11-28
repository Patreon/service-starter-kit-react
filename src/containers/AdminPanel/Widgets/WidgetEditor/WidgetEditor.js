import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { push } from 'react-router-redux';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import {ContentDescriptionEditor, /* MultiSelectWithSearch */} from 'components';
import {
    widgetLoadSuite,
    widgetCreateSuite,
    widgetEditSuite,
    widgetDeleteSuite,
} from 'redux/modules/widget';
// import * as multiselectRelationSearchActions from 'redux/modules/multiselectRelations/multiselectRelation-search';
import access from 'safe-access';


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
        const widgetID = params.widgetID;
        if (widgetID) {
            const widgetRef = widgetLoadSuite.selector(state);
            const loadedWidgetID = access(widgetRef, 'resources[0].id');
            if (loadedWidgetID && params.widgetID && (loadedWidgetID.toString() !== params.widgetID.toString())) {
                promises.push(dispatch(widgetLoadSuite.clearAction()));
                promises.push(dispatch(widgetEditSuite.clearAction()));
            }
            promises.push(dispatch(widgetLoadSuite.requestAction(params.widgetID)));
        } else {
            promises.push(dispatch(widgetLoadSuite.clearAction()));
            promises.push(dispatch(widgetCreateSuite.clearAction()));
        }

        return Promise.all(promises);
    }
}])
@connect(
    (state) => {
        const editWidgetRef = widgetLoadSuite.selector(state);
        const createWidgetRef = widgetCreateSuite.selector(state);
        return {
            widget: editWidgetRef.resources ? editWidgetRef.resources[0] : null,
            createdWidget: createWidgetRef.resources ? createWidgetRef.resources[0] : null,
            // multiselectRelationSearchResults: multiselectRelationSearchResultsSelector(state),
        };
    },
    {
        createWidget: widgetCreateSuite.requestAction,
        saveWidget: widgetEditSuite.requestAction,
        deleteWidget: widgetDeleteSuite.requestAction,
        pushState: push,
    }
)
export default class WidgetEditor extends Component {
    static propTypes = {
        widget: PropTypes.object,
        createWidget: PropTypes.func.isRequired,
        saveWidget: PropTypes.func.isRequired,
        deleteWidget: PropTypes.func.isRequired,
        createdWidget: PropTypes.object,
        pushState: PropTypes.func.isRequired,

        // multiselectRelationSearchResults: PropTypes.array,
        // search: PropTypes.func.isRequired,
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.createdWidget && nextProps.createdWidget) {
            this.props.pushState(`/widgets/${nextProps.createdWidget.id}`);
        }
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
        if (this.props.widget) {
            this.props.saveWidget(this.props.widget.id, name, descriptionHTML, /* selectedMultiselectRelationsAsRefs */)
                .then(() => {
                    this.props.pushState(`/widgets/${this.props.widget.id}`);
                });
        } else {
            this.props.createWidget(name, descriptionHTML, /* selectedMultiselectRelationsAsRefs */);
        }
    }

    handleDelete = (event) => {
        event.preventDefault();
        if (confirm('Delete the item?')) {
            this.props.deleteWidget(this.props.widget.id)
                .then(() => {
                    this.props.pushState(`/widgets`);
                });
        }
    }

    render() {
        return (
            <div className="container">
                {this.props.widget ? (
                    <div>
                        <h1>Edit Widget</h1>
                        <Helmet title="Edit Widget"/>
                    </div>
                ) : (
                    <div>
                        <h1>Create New Widget</h1>
                        <Helmet title="Create New Widget"/>
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
                        <button className="btn btn-success" onClick={this.handleSubmit}>
                            Save
                        </button>
                    </form>
                </div>
                {this.props.widget ? (
                    <div style={{paddingTop: '1em'}}>
                        <button className="btn btn-danger" onClick={this.handleDelete}>
                            Delete
                        </button>
                    </div>
                ) : null}
            </div>
        );
    }
}

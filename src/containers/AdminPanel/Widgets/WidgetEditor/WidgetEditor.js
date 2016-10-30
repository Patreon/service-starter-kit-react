import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import {ContentDescriptionEditor, /* MultiSelectWithSearch */} from 'components';
import {widgetLoadSuite, widgetCreateSuite, widgetEditSuite} from 'redux/modules/widget';
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
        const widgetRef = widgetLoadSuite.selector(state);
        return {
            widget: widgetRef.resources ? widgetRef.resources[0] : null,
            // multiselectRelationSearchResults: multiselectRelationSearchResultsSelector(state),
        };
    },
    {
        createWidget: widgetCreateSuite.requestAction,
        saveWidget: widgetEditSuite.requestAction,
    }
)
export default class WidgetEditor extends Component {
    static propTypes = {
        widget: PropTypes.object,
        createWidget: PropTypes.func.isRequired,
        saveWidget: PropTypes.func.isRequired,

        // multiselectRelationSearchResults: PropTypes.array,
        // search: PropTypes.func.isRequired,
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const name = this.refs.nameField.value;
        const descriptionHTML = this.refs.descriptionEditor.state.value.toString('html');
        // const selectedMultiselectRelationsAsRefs = this.refs.multiSelectWithSearch.state.selectedValues.map((multiselectRelation) => ({
        //     type: multiselectRelation.type,
        //     id: multiselectRelation.id
        // }));
        if (this.props.widget) {
            this.props.saveWidget(this.props.widget.id, name, descriptionHTML, /* selectedMultiselectRelationsAsRefs */);
        } else {
            this.props.createWidget(name, descriptionHTML, /* selectedMultiselectRelationsAsRefs */);
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
            </div>
        );
    }
}

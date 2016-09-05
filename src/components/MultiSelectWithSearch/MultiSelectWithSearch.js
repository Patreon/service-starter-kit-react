import React, {Component, PropTypes} from 'react';
import differenceWith from 'lodash.differencewith';
import isEqual from 'lodash.isequal';
import find from 'lodash.find';

const refIsEqual = (value, other) => {
    const valueRef = {type: value.type, id: value.id};
    const otherRef = {type: other.type, id: other.id};
    return isEqual(valueRef, otherRef);
};

export default class MultiSelectWithSearch extends Component {
    static propTypes = {
        selectedItems: PropTypes.array,
        onSearchChange: PropTypes.func.isRequired,
        searchResults: PropTypes.array,
    };

    constructor(props) {
        super(props);
        let initialValues = [];
        let initialIDs = [];
        if (this.props.selectedItems) {
            initialValues = this.props.selectedItems;
            initialIDs = initialValues.map((value) => ({
                type: value.type,
                id: value.id
            }));
        }
        this.state = {
            selectedValues: initialValues,
            selectedIDs: initialIDs
        };
    }

    onSearchFieldChange = (event) => {
        event.preventDefault();
        this.props.onSearchChange(this.refs.selectSearchField.value);
    };

    onClickSearchResult = (searchResultID) => {
        return (event) => {
            event.preventDefault();
            if (this.state.selectedIDs.indexOf(searchResultID) < 0) {
                const selectedResult = find(this.props.searchResults, (result) => (
                    result.id === searchResultID
                ));
                this.setState({
                    selectedIDs: this.state.selectedIDs.concat(searchResultID),
                    selectedValues: this.state.selectedValues.concat(selectedResult),
                });
            }
        };
    }

    onClickSelectedResult = (selectedResultID) => {
        return (event) => {
            event.preventDefault();
            const selectedResult = find(this.state.selectedValues, (result) => (
                result.id === selectedResultID
            ));
            this.setState({
                selectedIDs: differenceWith(this.state.selectedIDs, [selectedResultID], isEqual),
                selectedValues: differenceWith(this.state.selectedValues, [selectedResult], refIsEqual),
            });
        };
    }

    render() {
        const searchResultsMinusSelection = differenceWith(this.props.searchResults, this.state.selectedValues, refIsEqual);
        return (
            <div>
                <input type="text" ref="selectSearchField" placeholder="Find something..." className="form-control"
                    onChange={this.onSearchFieldChange} />
                {searchResultsMinusSelection && searchResultsMinusSelection.length > 0 ? (
                    <ul>
                        {searchResultsMinusSelection.map((searchResult) => (
                            <li key={searchResult.id} onClick={this.onClickSearchResult(searchResult.id)}>
                                {searchResult.title}
                            </li>
                        ))}
                    </ul>
                ) : null}
                {this.state.selectedValues && this.state.selectedValues.length > 0 ? (
                    <div>
                        <span>Selected:</span>
                        <ul>
                            {this.state.selectedValues.map((searchResult) => (
                                <li key={searchResult.id} onClick={this.onClickSelectedResult(searchResult.id)}>
                                    {searchResult.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        );
    }
}

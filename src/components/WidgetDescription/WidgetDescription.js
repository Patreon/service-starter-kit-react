import React, {Component, PropTypes} from 'react';

export default class WidgetDescription extends Component {
    static propTypes = {
        widget: PropTypes.object.isRequired
    }

    render() {
        return (
            <div>
                <h3>{this.props.widget.name}</h3>
                <div dangerouslySetInnerHTML={{__html: this.props.widget.description}} />
            </div>
        );
    }
}

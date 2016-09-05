import React, {Component, PropTypes} from 'react';

export default class StyleDescription extends Component {
    static propTypes = {
        reject: PropTypes.func.isRequired,
        accept: PropTypes.func.isRequired
    }

    render() {
        return (
            <div>
                <button className="btn btn-default" onClick={this.props.reject}>
                    Nope
                </button>
                {' '}
                <button className="btn btn-default" onClick={this.props.accept}>
                    Hell yes
                </button>
            </div>
        );
    }
}

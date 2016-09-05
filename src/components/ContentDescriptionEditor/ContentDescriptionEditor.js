import React, {Component, PropTypes} from 'react';
// RichTextEditor cannot be rendered server-side
// import RichTextEditor from 'react-rte';

export default class ContentDescriptionEditor extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        defaultValue: PropTypes.string
    };

    constructor(props) {
        super(props);
        let initialValue = undefined;
        if (this.props.defaultValue) {
            const RichTextEditor = this.richTextEditorImporter();
            if (RichTextEditor) {
                initialValue = RichTextEditor.createValueFromString(this.props.defaultValue, 'html');
            }
        }
        this.state = {
            value: initialValue
        };
    }

    onChange = (value) => {
        this.setState({value});
    };

    richTextEditorImporter = () => {
        const canUseDOM = !!(
          (typeof window !== 'undefined' &&
          window.document && window.document.createElement)
        );
        if (canUseDOM) {
            return require('react-rte');
        }
        return undefined;
    };

    render() {
        const RichTextEditor = this.richTextEditorImporter();
        if (RichTextEditor) {
            let value = this.state.value;
            if (value === undefined) {
                value = RichTextEditor.createEmptyValue();
            }
            return (
                <RichTextEditor.default
                    value={value}
                    onChange={this.onChange} />
            );
        }
        return (<div>Loading editor...</div>);
    }
}

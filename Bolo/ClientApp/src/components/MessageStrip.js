import React, { Component } from 'react';

export class MessageStrip extends Component {
    constructor(props) {
        super(props);
        
        this.state = { bsstyle: this.props.bsstyle !== undefined ? this.props.bsstyle : "", message: this.props.message !== undefined ? this.props.message : "" };

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.message !== prevState.message) {
            return { message: nextProps.message, bsstyle : nextProps.bsstyle };
        }
        else return null;
    }

    render() {
        if (this.state.message !== '') {
            return <div className={'noMargin noRadius alert alert-' + this.state.bsstyle} role="alert">
                    {this.state.message}
                </div>;
        } else {
            return <></>;
        }
    }
}
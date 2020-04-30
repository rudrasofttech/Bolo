import React, { Component } from 'react';

export class MessageStrip extends Component {

    render() {
        if (this.props.message) {
            return (
                <div className={'noMargin noRadius alert alert-' + this.props.bsstyle} role="alert">
                    {this.props.message}
                </div>
            );
        } else {
            return (
                <> </>
            );
        }
    }
}
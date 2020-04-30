import React, { Component } from 'react';
//import { Container } from 'reactstrap';


export class Layout extends Component {
  static displayName = Layout.name;

  render () {
    return (
      <div>
        <div className="container-fluid">
          {this.props.children}
        </div>
      </div>
    );
  }
}

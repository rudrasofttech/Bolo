import React, { Component } from 'react';
//import { Container } from 'reactstrap';


export class Layout extends Component {
  static displayName = Layout.name;

    render() {
      //children should have full control over html
    return (
      <>
          {this.props.children}
      </>
    );
  }
}

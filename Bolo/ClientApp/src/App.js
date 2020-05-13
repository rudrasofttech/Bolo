import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Meetings } from './components/Meetings';
import { Logout } from './components/Logout';
import { Meeting } from './components/Meeting';
import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Route exact path='/' component={Home} />
                <Route path='/meetings' component={Meetings} />
                <Route path='/logout' component={Logout} />
                <Route path='/m/:id' component={Meeting} />
            </Layout>
        );
    }
}

import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Meetings } from './components/Meetings';
import { Logout } from './components/Logout';
import { Meeting } from './components/Meeting';
import './custom.css'
import { Broadcast } from './components/Broadcast';
import { Live } from './components/Live';
import { Conversation } from './components/Conversation';

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Route exact path='/' component={Home} />
                <Route path='/meetings' component={Meetings} />
                <Route path='/broadcast' component={Broadcast} />
                <Route path='/logout' component={Logout} />
                <Route path='/m/:id' component={Meeting} />
                <Route path='/live/:channel' component={Live} />
                <Route path='/conversation' component={Conversation} />
            </Layout>
        );
    }
}

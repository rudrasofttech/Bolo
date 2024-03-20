import React, { Fragment } from 'react';
import NavBar from './shared/NavBar';

function Layout(props) {
    return <>
        <NavBar
            onAddPostClick={() => { console.log("add post click"); }}
            onSearchClick={() => { console.log("search lick"); }}
            onNotificationClick={() => { console.log("notification click"); }} />
        <Fragment>
            {props.children}
        </Fragment>
    </>;
}

export default Layout;
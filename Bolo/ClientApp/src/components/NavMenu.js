import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };

        const token = localStorage.getItem("token");

        if (token !== null) {
            this.fetchData(token);
        }
    }

    fetchData(t) {
        fetch('api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                this.setState({ loading: false });
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ bsstyle: 'danger', message: "Authorization has been denied for this request.", loggedin: false });
                }
            });
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        const token = localStorage.getItem("token");
        let loggedin = true;

        if (token === null) {
            loggedin = false;
        }
        let loggedinlinks = loggedin ? <>
            <NavItem><NavLink tag={Link} className="text-dark" to="/logout">Logout</NavLink></NavItem>
        </>
            : <>
                <NavItem><NavLink tag={Link} className="text-dark" to="/register">Login / Register</NavLink></NavItem>
            </>;
        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm fixed-top ng-white mb-3" light>
                    <div className="container-fluid">
                        <NavbarBrand tag={Link} to="/">Bolo</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                            <ul className="navbar-nav flex-grow">
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/">Home</NavLink>
                                </NavItem>
                                <NavItem><NavLink tag={Link} className="text-dark" to="/meetings">Meetings</NavLink></NavItem>
                                {loggedinlinks}
                            </ul>
                        </Collapse>
                    </div>
                </Navbar>
            </header>
        );
    }
}

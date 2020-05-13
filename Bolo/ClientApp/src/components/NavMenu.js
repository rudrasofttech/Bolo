import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import { RegisterForm } from './RegisterForm';

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            registermodal: this.props.register === undefined ? false : this.props.register,
            registerFormBeginWith : 'register'
        };

        const token = localStorage.getItem("token");

        if (token !== null) {
            this.fetchData(token);
        }
        this.loginHandler = this.loginHandler.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.closeRegisterModal = this.closeRegisterModal.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true, registermodal: false, registerFormBeginWith: false });
            if (this.props.onLogin !== undefined) {
                this.props.onLogin();
            }
        }
    }

    handleRegister(e) {
        this.setState({ registermodal: true, registerFormBeginWith: true });
    }

    handleLogin(e) {
        this.setState({ registermodal: true, registerFormBeginWith: false });
    }

    closeRegisterModal() {
        this.setState({ registermodal: false });
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
            <NavItem><NavLink tag={Link} className="text-dark translucent" to="/logout">Logout</NavLink></NavItem>
        </>
            : <>
                <NavItem><NavLink tag={Link} className="text-dark translucent" onClick={this.handleLogin}>Login</NavLink></NavItem>
                <NavItem><NavLink tag={Link} className="text-dark translucent" onClick={this.handleRegister}>Register</NavLink></NavItem>
            </>;

        return (
            <>
                <header>
                    <Navbar className="navbar-expand-sm navbar-toggleable-sm fixed-top translucent ng-white mb-3" light>
                        <div className="container-fluid">
                            <NavbarBrand tag={Link} to="/">Waarta</NavbarBrand>
                            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                                <ul className="navbar-nav flex-grow">
                                    <NavItem>
                                        <NavLink tag={Link} className="text-dark translucent" to="/">Home</NavLink>
                                    </NavItem>
                                    <NavItem><NavLink tag={Link} className="text-dark translucent" to="/meetings">Meetings</NavLink></NavItem>
                                    {loggedinlinks}
                                </ul>
                            </Collapse>
                        </div>
                    </Navbar>
                </header>
                <Modal isOpen={this.state.registermodal} toggle={this.closeRegisterModal}>
                    <ModalBody>
                        <button type="button" className="close pull-right" onClick={this.closeRegisterModal} aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <RegisterForm onLogin={this.loginHandler} beginWithRegister={this.state.registerFormBeginWith} />
                    </ModalBody>
                </Modal>
            </>
        );
    }
}

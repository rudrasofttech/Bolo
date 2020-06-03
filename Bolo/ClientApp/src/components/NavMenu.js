import React, { Component } from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Modal, ModalBody, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, ModalHeader, ModalFooter } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import { RegisterForm } from './RegisterForm';
import { BsFillPersonLinesFill, BsBoxArrowRight, BsFillPersonPlusFill, BsBackspace, BsHouseFill, BsFillXDiamondFill } from 'react-icons/bs';
import { FaUserCircle } from 'react-icons/fa';
import { ManageProfile } from './ManageProfile';

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);
        const token = localStorage.getItem("token");
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            loggedin: loggedin,
            collapsed: true,
            registermodal: this.props.register === undefined ? false : this.props.register,
            showinvite: this.props.onInvite === undefined ? false : true,
            showleavemeeting: this.props.onLeaveMeeting === undefined ? false : true,
            onProfileChange: this.props.onProfileChange === undefined ? null : this.props.onProfileChange,
            registerFormBeginWith: this.props.registerFormBeginWith === undefined ? true : this.props.registerFormBeginWith,
            membername: '',
            memberid: '',
            fixed: this.props.fixed === undefined ? true : this.props.fixed,
            showprofilemodal: false
        };

        if (token !== null) {
            this.fetchData(token);
        }
        this.loginHandler = this.loginHandler.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleOnInvite = this.handleOnInvite.bind(this);
        this.closeRegisterModal = this.closeRegisterModal.bind(this);
        this.handleLeaveMeeting = this.handleLeaveMeeting.bind(this);
        this.toggleProfileModal = this.toggleProfileModal.bind(this);
        this.handleProfileChange = this.handleProfileChange.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.fetchData(localStorage.getItem("token"));
            this.setState({ loggedin: true, registermodal: false, registerFormBeginWith: false });
            if (this.props.onLogin !== undefined) {
                this.props.onLogin();
            }
        }
    }

    handleProfileChange() {
        if (this.state.onProfileChange !== null) {
            this.state.onProfileChange();
        }
        if (localStorage.getItem("token") !== null) {
            this.fetchData(localStorage.getItem("token"));
        }

    }

    handleOnInvite(e) {
        if (this.props.onInvite !== undefined) {
            this.props.onInvite();
        }
    }

    handleLeaveMeeting(e) {
        if (this.props.onLeaveMeeting !== undefined) {
            this.props.onLeaveMeeting();
        }
    }

    handleRegister(e) {
        e.preventDefault();
        this.setState({ registermodal: true, registerFormBeginWith: true });
    }

    handleLogin(e) {
        e.preventDefault();
        this.setState({ registermodal: true, registerFormBeginWith: false });
    }

    toggleProfileModal() {
        this.setState({ showprofilemodal: !this.state.showprofilemodal });
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
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ bsstyle: 'danger', message: "Authorization has been denied for this request.", loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ bsstyle: '', message: "", loggedin: true, loading: false, membername: data.name, memberid: data.id, memberpic : data.pic });
                    });
                }
            });
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.register !== prevState.register) {
            return { registermodal: nextProps.register };
        }
        else return null;
    }

    render() {
        const token = localStorage.getItem("token");
        let loggedin = true;
        let fixedtop = this.state.fixed ? "fixed-top" : "";
        if (token === null) {
            loggedin = false;
        }
        let profilepic = <FaUserCircle />;
        if (loggedin && this.state.memberpic !== "") {
            profilepic = <img src={this.state.memberpic} width="20" height="20" className="rounded" />
        }
        let loggedinlinks = loggedin ? <>
            <NavItem><button type="button" className="btn btn-link text-light nav-link membernavlink" onClick={this.toggleProfileModal}>{profilepic} {this.state.membername}</button></NavItem>
            <NavItem><NavLink tag={Link} className="text-light" to="/logout">Logout</NavLink></NavItem>
        </>
            : <>
                <NavItem><button type="button" className="btn btn-link text-light nav-link" onClick={this.handleLogin}>Login</button></NavItem>
                <NavItem><button type="button" className="btn btn-link text-light nav-link" onClick={this.handleRegister}>Register</button></NavItem>
            </>;
        let showinvite = this.state.showinvite ? <NavItem><button type="button" className="btn btn-link text-light bg-info mr-2 ml-2 nav-link" onClick={this.handleOnInvite}>Invite <BsFillPersonPlusFill /></button></NavItem> :
            <></>;
        let showleavemeeting = this.state.showleavemeeting ? <NavItem><button type="button" className="btn btn-link text-light bg-danger mr-2 ml-2 nav-link" onClick={this.handleLeaveMeeting}>Leave <BsBackspace /></button></NavItem> :
            <></>;
        return (
            <>
                <header>
                    <Navbar className={"navbar-expand-sm navbar-toggleable-sm bg-dark ng-white " + fixedtop} dark>
                        <div className="container-fluid">
                            <NavbarBrand tag={Link} to="/">Waarta</NavbarBrand>
                            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                                <ul className="navbar-nav flex-grow">
                                    <NavItem>
                                        <NavLink tag={Link} className="text-light" to="/">Home</NavLink>
                                    </NavItem>
                                    <NavItem><NavLink tag={Link} className="text-light" to="/meetings">Meetings</NavLink></NavItem>
                                    {showinvite}
                                    {showleavemeeting}
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
                <Modal isOpen={this.state.showprofilemodal} className="modal-lg" toggle={this.toggleProfileModal}>
                    <ModalHeader toggle={this.toggleProfileModal}>Profile</ModalHeader>
                    <ModalBody>
                        <ManageProfile onProfileChange={this.handleProfileChange} />
                    </ModalBody>
                </Modal>
            </>
        );
    }
}

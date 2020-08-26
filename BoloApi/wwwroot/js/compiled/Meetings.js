﻿"use strict"; class Meetings extends React.Component { constructor(e) { super(e); let t = !0; null == localStorage.getItem("token") && (t = !1), this.state = { loading: !1, loggedin: t, bsstyle: "", message: "", meetingid: "", name: "", purpose: "" }, this.loginHandler = this.loginHandler.bind(this), this.handleStartMeeting = this.handleStartMeeting.bind(this), this.handleChange = this.handleChange.bind(this) } loginHandler() { null != localStorage.getItem("token") && this.setState({ loggedin: !0 }) } handleStartMeeting(e) { e.preventDefault(), fetch("api/Meetings", { method: "post", body: JSON.stringify({ Name: this.state.name, Purpose: this.state.purpose }), headers: { Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" } }).then(e => { this.setState({ loading: !1 }), 200 === e.status ? e.json().then(e => { console.log(e), window.location.href = "/m/" + e.id }) : this.setState({ bsstyle: "danger", message: "Unable to create a meeting. Please try again." }) }) } handleChange(e) { switch (e.target.name) { case "name": this.setState({ name: e.target.value }); break; case "purpose": this.setState({ purpose: e.target.value }) } } render() { let e = this.state.loading ? React.createElement("div", null, " ", React.createElement(Progress, { animated: !0, color: "info", value: "100", className: "loaderheight" }), " ") : null, t = "" !== this.state.message ? React.createElement("div", { className: "fixedBottom " }, React.createElement(MessageStrip, { message: this.state.message, bsstyle: this.state.bsstyle })) : null; return React.createElement("div", null, React.createElement(NavMenu, { onLogin: this.loginHandler, registerFormBeginWith: !1, fixed: !1 }), React.createElement("main", { role: "main", className: "inner cover meetingsmain mr-5 ml-5" }, React.createElement("h1", { className: "cover-heading" }, "Online Meetings"), React.createElement("p", { className: "lead" }, "Online meetings are the need of the hour. Connect with people for quick status updates, important discussions, future planning or interviews. Salient Features-"), React.createElement("ul", null, React.createElement("li", null, "Text, Audio and Video Chat Enabled"), React.createElement("li", null, "No need to install any special software, works on chrome, mozilla, safari and edge."), React.createElement("li", null, "Peer to Peer technlogy"), React.createElement("li", null, "Secured with SSL"), React.createElement("li", null, "Free to use")), React.createElement("div", { className: "row" }, React.createElement("div", { className: "col-md-6" }, React.createElement("form", { onSubmit: this.handleStartMeeting }, React.createElement("div", { className: "form-group" }, React.createElement("label", { htmlFor: "meetingnametxt" }, "Name (Optional)"), React.createElement("input", { type: "text", className: "form-control", id: "meetingnametxt", placeholder: "Friendly name of your meeting", name: "name", maxLength: "50", onChange: this.handleChange })), React.createElement("div", { className: "form-group" }, React.createElement("label", { htmlFor: "purposetxt" }, "Purpose (Optional)"), React.createElement("input", { type: "text", className: "form-control", id: "purposetxt", placeholder: "What is the agenda of the meeting", maxLength: "250", name: "purpose", onChange: this.handleChange })), React.createElement("h1", null, React.createElement("button", { type: "submit", className: "btn btn-primary my-2 startmeeting" }, "Create a Meeting")))))), React.createElement(HeartBeat, { activity: "1", interval: "3000" }), e, t) } }
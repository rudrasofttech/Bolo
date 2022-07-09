class MemberPost extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            post: this.props.post, showreactionlist: false, hashtag: this.props.hashtag ? this.props.hashtag : ''
        };

        this.addReaction = this.addReaction.bind(this);
    }

    addReaction() {
        fetch('//' + window.location.host + '/api/post/addreaction/' + this.state.post.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        var p = this.state.post;
                        p.hasReacted = data.hasReacted;
                        p.reactionCount = data.reactionCount;
                        this.setState({ loading: false, message: '', bsstyle: '', post: p });
                    });
                } else if (response.status === 400) {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                        });
                    } catch (err) {
                        this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                    }

                } else {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                        });
                    } catch (err) {
                        this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                    }

                }
            });
    }

    render() {
        var p = this.state.post;
        var ownerlink = this.state.hashtag !== '' ? <div className="d-inline-block">
            <a href={'//' + window.location.host + '/post/hastag?ht=' + this.state.hashtag} className="fs-6 ms-2 fw-bold  text-dark text-decoration-none">
                {p.owner.userName}
            </a>
            <a href={'//' + window.location.host + '/profile?un=' + p.owner.userName} className="fs-6 ms-2  text-dark text-decoration-none">
                {p.owner.userName}
            </a>
        </div> :
            <a href={'//' + window.location.host + '/profile?un=' + p.owner.userName} className="fs-6 ms-2 fw-bold pointer d-inline-block text-dark text-decoration-none">
                {p.owner.userName}
            </a>;
        var owner = <div className="row align-items-center g-1">
            <div className="col">
                <MemberPicSmall member={p.owner}/>
                {ownerlink}
            </div>
            <div className="col-md-1 col-1 text-end">
                <button className="btn btn-link text-dark"><i className="bi bi-three-dots"></i></button>
            </div>
        </div>;
        var postshtml = null;
        if (p.videoURL !== "") {

        } else if (p.photos) {
            if (p.photos.length == 1) {
                postshtml = <div className="text-center">
                    <img src={p.photos[0].photo} className="img-fluid" onDoubleClick={() => { this.addReaction(); }} />
                </div>
            } else {
                var imgs = [];
                for (var i in p.photos) {
                    imgs.push(<li key={"img" + p.photos[i].id} className="list-group-item p-0 me-1 border-0"><img src={p.photos[i].photo} style={{ maxHeight: "450px", maxWidth: "450px" }} /></li>);
                }
                postshtml = <div className="table-responsive">
                    <ul className="list-group list-group-horizontal" onDoubleClick={() => { this.addReaction(); }}>
                        {imgs}
                    </ul></div>;
            }
        }
        var reactionCountHtml = (p.reactionCount > 0) ? <button className="btn btn-link text-dark text-decoration-none fw-bold" type="button" onClick={() => { this.setState({ showreactionlist: true }) }}>{p.reactionCount} Likes</button> : null;

        var reactionhtml = <button type="button" className="btn btn-light fs-4 text-dark me-2" onClick={() => { this.addReaction(); }}><i className="bi bi-heart"></i></button>;
        if (p.hasReacted) {
            reactionhtml = <button type="button" className="btn btn-light fs-4 text-danger me-2" onClick={() => { this.addReaction(); }}><i className="bi bi-heart-fill"></i></button>;
        }
        var commentBtn = null, commentCountHtml = null;
        if (p.acceptComment) {
            commentCountHtml = p.commentCount > 0 ? <span className="fw-bold">{p.commentCount} Comments</span> : null;
            commentBtn = <button type="button" className="btn btn-light fs-4 text-dark"><i className="bi bi-chat-square-text"></i></button>;
        }
        var likemodal = null;
        if (this.state.showreactionlist) {
            likemodal = <div className="modal fade show d-block" id={"reactionListModal-" + this.state.post.id} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen-lg-down">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Likes</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showreactionlist: false }); }}></button>
                        </div>
                        <div className="modal-body p-1">
                            <MemberSmallList target="reaction" postid={this.state.post.id} />
                        </div>
                    </div>
                </div>
            </div>
        }
        return <div id={this.state.post.id} className="border-bottom py-2">
            {owner}
            {postshtml}
            <div className="row mt-1">
                <div className="col">{reactionhtml}</div>
                <div className="col">
                    <div className="text-end">{reactionCountHtml}{commentCountHtml}</div>
                </div>
            </div>
            <div className="p-2" style={{ whiteSpace: "pre-wrap" }}>{this.state.post.describe}</div>
            {likemodal}
        </div>;
    }
}
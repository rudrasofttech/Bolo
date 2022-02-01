class CreatePost extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            src: [], caption: "", message : '', bsstyle:''
        };
        this.canvas = null;
        this.context = null;
        this.handleChangeFile = this.handleChangeFile.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.renderCanvas = this.renderCanvas.bind(this);
        this.savePost = this.savePost.bind(this);
    }

    componentDidMount() {
        setTimeout(function () { document.getElementById("fileinput").click(); }, 300);
    }

    handleFile = (e) => {
        const content = e.target.result;
        var temp = this.state.src;
        temp.push(content);
        this.setState({ src: temp });
    }

    handleChangeFile = (file) => {
        for (var i = 0; i < file.length; i++) {
            let fileData = new FileReader();
            fileData.onloadend = this.handleFile;
            fileData.readAsDataURL(file[i]);
        }
    }

    renderCanvas() {
        var items = [];
        for (var k = 0; k < this.state.src.length; k++) {
            items.push(<PhotoCanvas canvasindex={k} source={this.state.src[k]} />)
        }
        return <React.Fragment>{items}</React.Fragment>;
    }

    savePost() {
        const fd = new FormData();
        fd.set("caption", this.state.caption);
        for (var i = 0; i < this.state.src.length; i++) {
            fd.set("photos["  + i +"]", this.state.src[i]);
        }
        fetch('//' + window.location.host + '/api/Photo', {
            method: 'post',
            body: fd,
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
                    this.setState({ loading: false });
                    this.props.onPostSuccess();
                } else {
                    this.setState({ loading: false, message: 'Unable to save data', bsstyle: 'danger' });
                }
            });
    }

    render() {
        let loading = this.state.loading ? <div className="progress fixed-top" style={{ height: "10px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: '100%' }}></div>
        </div> : null;
        if (this.state.loggedin) {
            let message = this.state.message !== "" ? <div className={'text-center noMargin noRadius alert alert-' + this.state.bsstyle} role="alert">
                {this.state.message}
            </div> : null;

            return <div className='container'>
                <div className="row">
                    <div className="col-lg-8 col-md-7 text-center p-1">
                        {this.renderCanvas()}
                        <input type="file" id="fileinput" multiple accept="*.jpg|*.jpeg|*.png" className="d-none" onChange={e =>
                            this.handleChangeFile(e.target.files)} />
                    </div>
                    <div className="col-lg-4 col-md-5 p-1">
                        {loading}
                        {message}
                        <div className="mb-3">
                            <textarea className="form-control" placeholder="Write something here..." rows="10" value={this.state.caption} onChange={(e) => { this.setState({ caption: e.target.value }) }}></textarea>
                        </div>
                        <div className="mb-3">
                            <button type="button" className="btn btn-secondary" onClick={() => { this.savePost(); }}>Post</button>
                        </div>
                    </div>
                </div>
            </div>;
        } else {
            return null;
        }
    }
}
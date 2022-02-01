class PhotoCanvas extends React.Component {
    constructor(props) {
        super(props);
        const hasWindow = typeof window !== 'undefined';
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            picture: "", width: hasWindow ? window.innerWidth : null,
            height: hasWindow ? window.innerHeight : null, src: this.props.source, canvasindex : this.props.canvasindex
        };
        //this.image = new Image();
        //this.image.src = this.props.source;
        //this.canvas = null;
        //this.context = null;
        //this.centeredImageOn = this.centeredImageOn.bind(this);
    }

    componentDidMount() {
        //this.canvas = document.getElementById('canvas' + this.state.canvasindex);
        //this.context = document.getElementById('canvas' + this.state.canvasindex).getContext('2d');
        //this.centeredImageOn(this.canvas, this.image);
    }

    //centeredImageOn(canvas, imageObj) {
    //    var canvaswidth = canvas.width, canvasheight = canvas.height;

    //    var canvasAspectRatio = canvaswidth / canvasheight;
    //    var renderableHeight, renderableWidth, xStart, yStart;
    //    console.log(Date.now());
    //    if (imageObj.width < canvaswidth && imageObj.height < canvasheight) {
    //        renderableHeight = imageObj.height;
    //        renderableWidth = imageObj.width;
    //        xStart = (canvaswidth / 2) - (imageObj.width / 2);
    //        yStart = (canvasheight / 2) - (imageObj.height / 2);
    //    } else {
    //        if (imageObj.width > imageObj.height) {
    //            var imageAspectRatio = imageObj.width / imageObj.height;
    //            renderableHeight = canvasheight;
    //            renderableWidth = imageAspectRatio * canvasheight;
    //        } else {
    //            var imageAspectRatio = imageObj.height / imageObj.wi;
    //            renderableHeight = imageAspectRatio * canvaswidth;
    //            renderableWidth = canvaswidth;
    //        }
    //        xStart = (canvaswidth / 2) - (renderableWidth / 2);
    //        yStart = (canvasheight / 2) - (renderableHeight / 2);
    //    }
        
    //    console.log(imageObj.src);
    //    this.context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);
    //};

        //fitImageOn(canvas, imageObj) {
    //    var imageAspectRatio = imageObj.width / imageObj.height;
    //    var canvasAspectRatio = canvas.width / canvas.height;
    //    var renderableHeight, renderableWidth, xStart, yStart;

    //    // If image's aspect ratio is less than canvas's we fit on height
    //    // and place the image centrally along width
    //    if (imageAspectRatio < canvasAspectRatio) {
    //        renderableHeight = canvas.height;
    //        renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
    //        xStart = (canvas.width - renderableWidth) / 2;
    //        yStart = 0;
    //    }

    //    // If image's aspect ratio is greater than canvas's we fit on width
    //    // and place the image centrally along height
    //    else if (imageAspectRatio > canvasAspectRatio) {
    //        renderableWidth = canvas.width
    //        renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
    //        xStart = 0;
    //        yStart = (canvas.height - renderableHeight) / 2;
    //    }

    //    // Happy path - keep aspect ratio
    //    else {
    //        renderableHeight = canvas.height;
    //        renderableWidth = canvas.width;
    //        xStart = 0;
    //        yStart = 0;
    //    }
    //    this.context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);
    //};


    render() {
        var width = 600, height = 600;
        if (this.state.width < this.state.height) {
            width = this.state.width;
            height = width;
        } else {
            width = this.state.height;
            height = width;
        }
        return <img id={"canvas" + this.state.canvasindex} src={this.state.src} className="img-fluid" />
        ;
    }
}
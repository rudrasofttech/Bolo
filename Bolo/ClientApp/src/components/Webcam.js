import React from "react";

export class Webcam extends React.Component {

    
    constructor(props) {
        super(props)

        // Create the ref
        this.videoRef = React.createRef()
        this.state = {
            source: null
        }
    }


    componentDidMount() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(this.handleVideo)
                .catch(this.videoError);
        }
    }

    handleVideo = (stream) => {
        this.videoRef.srcObject = stream;
    }

    videoError = (err) => {
        console.log(err);
    }

    render() {
        return (
            <video  ref={this.videoRef} className="full" autoPlay>
            </video>
        )
    }
}
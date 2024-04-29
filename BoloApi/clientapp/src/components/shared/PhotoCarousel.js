import { useState } from "react";

function PhotoCarousel(props) {
    const [active, setActive] = useState(0);

        return <>
            <div id={`carousel${props.postid}`} className="carousel carousel-dark slide" data-bs-ride="true">
                <div className="carousel-indicators">
                    {props.photos.map((i, k) => <button key={k} type="button" data-bs-target={`carousel${props.postid}`} className={k === active ? "active" : ""} data-index={k}
                        onClick={(e) => {
                            setActive(parseInt(e.target.getAttribute("data-index", 10)));
}}></button>)}
                </div>
                <div className="carousel-inner">
                    {props.photos.map((i, k) => <div key={k} className={k === active ? "carousel-item text-center active" : "carousel-item text-center"}>
                        <img src={props.photos[k].photo} className="img-fluid w-100" alt="" />
                    </div>)}
                </div>
                <button className={active === 0 ? "d-none" : "carousel-control-prev"} type="button" data-bs-target={`carousel${props.postid}`} data-bs-slide="prev" onClick={() => {
                    if (active > 0) {
                        setActive(active - 1);
                    }
                }}>
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className={active === props.photos.length - 1 ? "d-none" : "carousel-control-next"} type="button" data-bs-target={`carousel${props.postid}`} data-bs-slide="next" onClick={() => {
                    if (active < props.photos.length - 1) {
                        setActive(active + 1);
                    }
                }}>
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </>;
    
}
export default PhotoCarousel;
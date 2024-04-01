function Spinner(props) {
    if (props.center) {
        return <div className="d-flex justify-content-center">
            <div className={props.sm ? "spinner-border spinner-border-sm" : "spinner-border" } role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    } else {
        return <div className={props.sm ? "spinner-border spinner-border-sm" : "spinner-border"} role="status">
            <span className="visually-hidden">Loading...</span>
        </div>;
    }


}
export default Spinner;
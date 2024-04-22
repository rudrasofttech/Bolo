function Spinner({show = false, center = false, sm = false}) {
    if (!show) return null;
    if (center) {
        return <div className="d-flex justify-content-center">
            <div className={sm ? "spinner-border spinner-border-sm" : "spinner-border" } role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    } else {
        return <div className={sm ? "spinner-border spinner-border-sm" : "spinner-border"} role="status">
            <span className="visually-hidden">Loading...</span>
        </div>;
    }
}
export default Spinner;
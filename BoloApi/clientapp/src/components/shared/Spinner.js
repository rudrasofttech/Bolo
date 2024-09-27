function Spinner({show = false, center = false, sm = false}) {
    if (!show) return null;
    if (center) {
        return <div className="position-fixed border top-50 start-50 translate-middle bg-white rounded-2 p-2" style={{width:150, height:150}}>
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
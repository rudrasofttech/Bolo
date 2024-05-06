import {  useEffect, useRef, useState } from "react";

function DropDownButton({ expanded = false, direction = "dropdown", buttoncss = "btn-primary", text = "", dropdowncss = "", children = null }) {
    const [open, setExpanded] = useState(expanded);
    const button = useRef(null);
    const [style, setStyle] = useState(null);
    useEffect(() => {
        if (open) {
            if (direction.indexOf("dropup") > -1) {
                let temp = { inset: "auto auto 0px 0px", margin: "0px", transform: `translate3d(0px, -${button.current.offsetHeight + 3}px, 0px)` };
                setStyle(temp);
            }
        }
    }, [open, direction])
    
    return <div className={direction}>
        <button ref={button} className={"btn dropdown-toggle " + buttoncss} type="button" aria-expanded={open} onClick={() => {
            setExpanded(!open);
        }}>
            {text}
        </button>
        <ul className={"dropdown-menu " + dropdowncss + (open ? " show" : "")} style={style}>
            {children}
        </ul>
    </div>;
}

export default DropDownButton;
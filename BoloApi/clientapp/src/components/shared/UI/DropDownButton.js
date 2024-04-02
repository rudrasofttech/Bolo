import {  useState } from "react";

function DropDownButton({ expanded = false, direction = "dropdown", buttoncss = "btn-primary", text = "", dropdowncss = "", children = null }) {
    const [open, setExpanded] = useState(expanded);

    return <div className={direction}>
        <button className={"btn dropdown-toggle " + buttoncss} type="button" aria-expanded={open} onClick={() => { setExpanded(!open); }}>
            {text}
        </button>
        <ul className={"dropdown-menu " + dropdowncss + (open ? " show" : "")}>
            {children}
        </ul>
    </div>;
}

export default DropDownButton;
import { useState } from "react";

function AutoAdjustTextArea(props) {
    const [rows, setRows] = useState(props.minRows);
    
    const valueChanged = (val) => {
        let newlines = val.split('\n').length;
        if (newlines > props.maxRows) newlines = props.maxRows;
        else if (newlines < props.minRows) newlines = props.minRows;

        setRows(newlines);
        props.onChange(val);
    };

    
    return <textarea maxLength={props.maxlength} {...props.htmlattr} rows={rows} className={props.cssclass} value={props.value}
        onChange={(e) => { valueChanged(e.target.value); }}></textarea>;
}
export default AutoAdjustTextArea;
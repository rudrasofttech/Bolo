import { useState } from "react";

function SecurityQuestionSampleList(props) {
    const list = ["What is the name of your first friend?",
        "What was the make and model of your first car?",
        "In what city did your parents meet?",
        "What is your birth place?",
        "What is your favourite place to visit?",
        "What was the name of the first school you remember attending?"];
    const [copiedText, setCopiedText] = useState("");


    const items = list.map((i, index) => <li key={index} className={"pointer mb-2 p-2 " + (i === copiedText ? " bg-success text-white " : "")} onClick={() => {
        navigator.clipboard.writeText(i);
        setCopiedText(i);
        if (props.onQuestionSelect !== undefined) {
            props.onQuestionSelect(i);
        }
    }}>{i}</li>);

    return <div>
        <ul className="list-group securityquestionlist">
            {items}
        </ul>
        <div style={{ fontSize: "0.7rem" }} className="text-center p-1">Click to select</div>
    </div>;
}

export default SecurityQuestionSampleList;
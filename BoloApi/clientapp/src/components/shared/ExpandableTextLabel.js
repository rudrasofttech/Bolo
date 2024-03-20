import { useState } from "react";

function ExpandableTextLabel(props) {
    const nlcount = props.text.split(/\r\n|\r|\n/).length;
    const chcount = props.text.length;
    const [expand, setExpand] = useState(!(nlcount > 4 || chcount > props.maxlength));
    const showexpand = (nlcount > 4 || chcount > props.maxlength);

    const renderText = () => {
        if (props.text.trim() === "") return null;
        let t = null, expandbtn = null;

        if (expand) {
            let tempdescribe = props.text;
            let describe = props.text;
            let hashtagarr = tempdescribe.replace(/\n/g, " ").split(" ").filter(v => v.startsWith('#'));
            hashtagarr.forEach(function (hashtag) {
                let myExp = new RegExp(hashtag + "\\s", 'g');
                describe = describe.replace(myExp, "<a href='//" + window.location.host + "/?q=" + encodeURIComponent(hashtag) + "'>" + hashtag + "</a> ");
            });
            t = <>
                {describe.split('\n').map((item, key) => {
                    return <><span dangerouslySetInnerHTML={{ __html: item }}></span><br /></>
                })}
            </>;
        } else {
            let temp = props.text.split(/\r\n|\r|\n/).join(" ");
            if (temp.length > props.maxlength) {
                temp = temp.substring(0, props.maxlength);
            }
            t = <>{temp}</>;
        }

        if (showexpand) {
            expandbtn = <span onClick={() => { setExpand(!expand) }} className="text-primary ps-2 fw-semibold" >{(!expand) ? "More" : "Less"}</span>
        }

        return <div className={props.cssclass}>{t}{expandbtn}</div>;
    }

    return <>{renderText()}</>
}
export default ExpandableTextLabel;
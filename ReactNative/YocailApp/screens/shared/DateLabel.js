export default function DateLabel(props) {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const transformData = () => {
        let d = new Date(props.value);
        return d.getDate() + " " + month[d.getMonth()] + " " + d.getFullYear();
    }

    return <>{transformData()}</>
}

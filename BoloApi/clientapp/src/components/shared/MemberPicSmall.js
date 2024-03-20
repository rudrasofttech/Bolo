function MemberPicSmall(props) {
        let memberpic = props.member.pic !== "" ? <a href={`//${window.location.host}/profile?un=${props.member.userName}`} className="border-0">
            <img src={props.member.pic} className="img-fluid pointer profile-pic-border rounded-circle owner-thumb-small" alt="" />
        </a>
            : <a href={`//${window.location.host}/profile?un=${props.member.userName}`} className="border-0 text-secondary">
                <img src={`//${window.location.host}/theme1/images/person-fill.svg`} alt="No Pic" className=" img-fluid pointer profile-pic-border owner-thumb-small" />
            </a>;

        return <>{memberpic}</>;
    
}
export default MemberPicSmall;
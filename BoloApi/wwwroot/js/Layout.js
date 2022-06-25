class Layout extends React.Component {
    static displayName = Layout.name;

    render() {
        console.log(this.props.children);
        return (
            <div>
                <div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
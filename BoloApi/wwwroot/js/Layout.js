class Layout extends React.Component {
    static displayName = Layout.name;

    render() {
        return (
            <div>
                
                <div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
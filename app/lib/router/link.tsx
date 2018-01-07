import * as React from 'react';
import history, {goto} from './history';

export interface LinkProps {
    activeClass?:string,
    to:string,
    className?:string
}

export interface LinkState {
    pathname?:string
}

export class Link extends React.Component<LinkProps, LinkState> {
    unlisten?:Function

    state = {
        pathname: ''
    }

    componentWillMount() {
        if (this.props.activeClass) {
            this.setState({pathname: history.location.pathname});
            this.unlisten = history.listen(this.pathChange);
        }
    }

    componentWillUnmount() {
        this.unlisten && this.unlisten();
    }

    pathChange = () => {
        this.setState({pathname: history.location.pathname});
    }

    onClick = (e:any, replace?:boolean) => {
        e.preventDefault();
        const pathname = e.currentTarget.pathname;
        const search = e.currentTarget.search;
        const hash = e.currentTarget.hash;
        goto({pathname, search, hash, replace});
    }

    render() {
        const {children, to, className, activeClass, ...restProps} = this.props;
        const classes = [className];
        if (this.state.pathname === to) {
            classes.push(activeClass);
        }
        return <a
            className={classes.filter((v) => v).join(' ')}
            href={to}
            onClick={this.onClick}
            {...restProps}>{children}</a>;
    }
}
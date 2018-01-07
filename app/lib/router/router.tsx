import * as React from 'react';
import * as pathToRegexp from 'path-to-regexp';
import parseQueryString from './parse-querystring';
import history, {replacePath} from './history';
import {PATH} from './store';

export interface Store {
    dispatch:Function
}
export interface RouterProps {
    routes:Array<any>,
    notFoundPath?:string,
    store?:Store
}

export class Router extends React.Component<RouterProps> {
    unlisten?:Function
    paths:Array<any> = []
    params:Object = {}

    state = {el: null}

    componentDidMount() {
        this.unlisten = history.listen(this.matchRoute);
        this.matchRoute(history.location);
    }

    componentWillUnmount() {
        this.unlisten();
    }

    matchRoutes = (routes, path = [], location) => routes.some((route) => {
        if (route.routes) {
            return this.matchRoutes(route.routes, path.concat(route), location);
        }
        const keys = [];
        const pattern = pathToRegexp(path.concat(route).map((p) => p.path || '').join('').replace(/\/{2,}/g, '/'), keys);
        const match = location.pathname.match(pattern);
        if (match) {
            this.params = {};
            this.paths = [];
            match.slice(1).forEach((value, i) => {this.params[keys[i].name] = value;});
            this.paths = path.concat(route);
            return true;
        }
        return false;
    })

    matchRoute = (location) => {
        this.params = {};
        this.paths = [];
        const hasMatch = this.matchRoutes(this.props.routes, [], location);
        let el = null;
        const route = {
            params: this.params,
            query: parseQueryString(history.location.search.substr(1)) || {},
            hash: history.location.hash.substr(1),
            pathname: history.location.pathname,
            error: undefined
        };

        if (hasMatch) {
            for (const path of this.paths) {
                if (path.component && path.component.onEnter) {
                    if (!path.component.onEnter(this.props.store, replacePath)) {
                        return;
                    }
                }
            }

            el = this.paths.reverse().reduce((r, path) => {
                if (path.component) {
                    if (path.component.onEnter) {
                        path.component.onEnter(this.props.store, replacePath);
                    }
                    return <path.component route={route}>{r}</path.component>;
                }
                return r;
            }, null);

        }

        if (!el && this.props.notFoundPath) {
            replacePath(this.props.notFoundPath);
            return;
        }

        if (this.props.store) {
            this.props.store.dispatch({type: PATH, payload: route});
        }

        this.setState({el});
    }

    render() {
        return this.state.el;
    }
}
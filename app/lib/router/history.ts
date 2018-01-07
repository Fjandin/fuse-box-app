import createHistory from 'history/createBrowserHistory';

const history = createHistory();

export interface Goto {
    pathname:string,
    search?:string,
    hash?:string,
    replace?:boolean
}

export const goto = ({pathname, search, hash, replace}:Goto) => replace
    ? history.push({pathname, search, hash})
    : history.replace({pathname, search, hash});

export const pushPath = (pathname) => goto({pathname});

export const replacePath = (pathname) => goto({pathname, replace:true});

export default history;

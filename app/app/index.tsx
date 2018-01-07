import * as React from 'react';
import * as ReactDom from 'react-dom';

import {Router} from 'lib/router';
import Wrapper from 'pages/_general/wrapper';
import PageNotFound from 'pages/not-found';
import PageLogin from 'pages/login';

import 'styles/reset.css'
import 'styles/global.css'

const routes = [{component: Wrapper, routes: [
    {component: PageLogin, path: '/'},
    {component: PageNotFound, path: '/not-found'},
    {component: PageLogin, path: '/login'}
]}];

export default () => {
    ReactDom.render(
        <Router routes={routes} notFoundPath="/not-found" />,
        document.getElementById('app')
    )
}

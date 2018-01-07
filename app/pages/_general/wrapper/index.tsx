import * as React from 'react';

import {Link} from 'lib/router';

import styles from './styles.css';

export default class Wrapper extends React.Component {
    render() {
        return (
            <div className={styles.app}>
                <div>
                    <Link to="/">Home</Link>
                    <Link to="/login">Login</Link>
                    <div className={styles.test}>blahblah</div>
                </div>
                {this.props.children}
            </div>
        )
    }
}

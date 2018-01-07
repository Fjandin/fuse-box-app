import * as React from 'react';
import * as Redux from 'redux';
import {connect} from 'react-redux';
import classcat from 'classcat';

import styles from './styles.css';

export interface ModalObjectOptions {
    escape?:boolean,
    enter?:boolean
}

export interface ModalObject {
    id:string,
    component:React.ComponentClass<ModalComponentProps>,
    resolve:Function,
    reject:Function,
    options:ModalObjectOptions,
    removing?:boolean
}

export interface ModalComponentProps {
    modal: ModalObject
}

export interface ModalProps {
    modals:Array<ModalObject>
}

export class Modal extends React.Component<ModalProps> {
    modalsEl:HTMLElement

    componentWillReceiveProps(props:ModalProps):void {
        const scrollVisible = document.body.clientHeight < document.body.scrollHeight;
        window.removeEventListener('keydown', this.onKeyDown);
        if (props.modals.length) {
            window.addEventListener('keydown', this.onKeyDown);
            document.body.style.position = 'fixed';
            document.body.style.overflowY = scrollVisible ? 'scroll' : 'auto';
        } else {
            document.body.style.position = 'static';
            document.body.style.overflowY = 'auto';
        }
    }

    onKeyDown = (e:KeyboardEvent):void => {
        if (e.keyCode === 27) {
            e.preventDefault();
            e.stopPropagation();
            const modal = this.props.modals.find((m) => m.options.escape);
            modal && modal.reject();
        } else if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            const modal = this.props.modals.find((m) => m.options.enter);
            modal && modal.resolve();
        }
    }

    onWrapperClick = (e:React.SyntheticEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.modalsEl.contains(e.target as Node)) {
            const modal = this.props.modals.find((m) => m.options.escape);
            modal && modal.reject();
        }
    }

    renderModal = (modal:ModalObject):React.ReactElement<{}> => {
        const classes = classcat([styles.modal, {[styles.disappear]: modal.removing}]);
        return (
            <div key={modal.id} className={classes}>
                <modal.component modal={modal} />
            </div>
        );
    }

    render():React.ReactElement<{}> {
        if (!this.props.modals.length) {
            return null;
        }
        const removing = !this.props.modals.some((modal) => !modal.removing);
        const classes = classcat([styles.wrapper, {[styles.fadeOut]: removing}]);
        const modals = this.props.modals.map(this.renderModal);
        return (
            <div className={classes} onClick={this.onWrapperClick}>
                <span ref={(el) => {this.modalsEl = el;}}>{modals}</span>
            </div>
        );
    }
}

export default connect((state) => ({modals: state.modal.modals}))(Modal);

// Constants
export enum Actions {
    ADD_MODAL = 'modal/ADD_MODAL',
    REMOVING_MODAL = 'modal/REMOVING_MODAL',
    REMOVE_MODAL = 'modal/REMOVE_MODAL'
}

// Reducer
export interface ModalStoreState {
    modals:Array<ModalObject>
}

const initialState:ModalStoreState = {modals: []};

export function reducer (state:ModalStoreState = initialState, action):ModalStoreState {
    const {payload} = action;
    switch (action.type) {
        case Actions.ADD_MODAL:
            return {...state, modals: [payload, ...state.modals]};
        case Actions.REMOVING_MODAL: {
            const index = state.modals.findIndex((m) => m.id === payload);
            if (index < 0) {
                return state;
            }
            return {...state, modals: [
                ...state.modals.slice(0, index),
                {...state.modals[index], removing: true},
                ...state.modals.slice(index + 1)
            ]};
        }
        case Actions.REMOVE_MODAL: {
            const index = state.modals.findIndex((m) => m.id === payload);
            if (index < 0) {
                return state;
            }
            return {...state, modals: [
                ...state.modals.slice(0, index),
                ...state.modals.slice(index + 1)
            ]};
        }
    }
    return state;
}

// Actions
export const actionRemoveModal = (id:string):Function => async (dispatch:Redux.Dispatch<Redux.Action>) => {
    dispatch({type: Actions.REMOVING_MODAL, payload: id});
    await new Promise((resolve) => setTimeout(resolve, 150));
    dispatch({type: Actions.REMOVE_MODAL, payload: id});
    return true;
};

export const actionsAddModal = (component:React.Component, o:ModalObjectOptions = {}) => (dispatch):Promise<{}> => {
    const options = {
        escape: true,
        ...o
    };
    let id = Math.random().toString().replace('.', '');
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    dispatch({type: Actions.ADD_MODAL, payload: {id, component, options, resolve, reject, promise}});

    promise
        .then((a) => {
            dispatch(actionRemoveModal(id));
            resolve(a);
        })
        .catch((err) => {
            dispatch(actionRemoveModal(id));
            reject(err);
        });


    return promise;
};


export const PATH = 'router/PATH';

export const reducer = (state = {pathname: null, params: {}, query: {}, hash: ''}, action) => {
    const {payload} = action;
    switch (action.type) {
        case PATH:
            return {...state, ...payload};
    }
    return state;
}

import access from 'safe-access';

const initialState = {
    _fetchedAt: null
};

export default (state = initialState, action) => {
    if (access(action, 'meta.nextDataState') && action.meta.nextDataState !== state) {
        return action.meta.nextDataState;
    }
    return state;
};

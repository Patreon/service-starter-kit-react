import access from 'safe-access';


export default (actionType, actionKey) => {
    const pendingQuery = actionKey ?
    `requests.${actionType}.${actionKey}.pending` :
    `requests.${actionType}.pending`;

    return (state) => !!(access(state, pendingQuery));
};

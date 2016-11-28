import access from 'safe-access';

export const getResourceForRef = (state, ref) => {
    if (!(ref && ref.type && ref.id)) {
        return undefined;
    }
    return access(state, `data.${ref.type}.${ref.id}`);
};

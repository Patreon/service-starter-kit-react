import UserResource, { UserSerializer } from '../../resources/user-resource';

export default function serializeUser(user, request) {
    return new Promise((resolve, reject) => {
        UserSerializer.objectToJSON(user, (error, formattedResult) => {
            if (error) {
                reject(error);
            }
            const generateJSONAPIData = require('jsonapi-server/lib/responseHelper')._generateDataItem;
            const userJSONAPIData = generateJSONAPIData(formattedResult, (new UserResource()).attributes);
            resolve(userJSONAPIData);
        }, {request, type: 'user'});
    });
}

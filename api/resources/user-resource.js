import {Joi as types} from 'jsonapi-server/lib/ourJoi';
import JSONAPIHandler from './jsonapi-handler';
import JSONAPISerializer from './jsonapi-serializer';
import JSONAPIMask from './jsonapi-mask';
import { create as createStoredSession } from '../models/session';
import { create as createStoredUser } from '../models/user';

const userSchema = {
    type: 'user',
    attributes: {
        email: types.string().email().required(),
        password: types.string(),
        created_at: types.date().iso().allow(null),
        is_admin: types.bool().meta('readonly')
    },
    relationships: {}
};

export class UserSerializer extends JSONAPISerializer {
    static schema() {
        return userSchema;
    }

    static shouldIncludeAttribute(attribute) {
        return ['password', 'salt'].indexOf(attribute) < 0;
    }
}

class UserMask extends JSONAPIMask {
    static canCreate() {
        return this.booleanToPromise(true);
    }

    static canRead(model, session) {
        return this.booleanToPromise(model.id === session.userID || (session && session.isAdmin));
    }

    static canUpdate(model, session) {
        return this.booleanToPromise(model.id === session.userID || (session && session.isAdmin));
    }

    static canDelete(model, session) {
        return this.booleanToPromise(model.id === session.userID || (session && session.isAdmin));
    }
}

class UserHandler extends JSONAPIHandler {
    tableName = 'users'

    serializer = UserSerializer
    mask = UserMask

    create(request, newResource, callback) {
        this.mask.canCreate(request.session)
            .then(() => {
                const tableData = this._objectFromJSON(newResource, request);
                createStoredUser(tableData.email, tableData.password)
                    .then((result) => {
                        this._objectToJSON(result, (error, formattedResult) => {
                            const email = formattedResult.email;
                            const password = tableData.password;
                            createStoredSession(request.session, email, password)
                                .then(() => {
                                    callback(null, formattedResult);
                                })
                                .catch((sessionError) => {
                                    callback(sessionError, null);
                                });
                        }, {request});
                    })
                    .catch((error) => {
                        callback(error, null);
                    });
            })
            .catch(() => {
                callback({
                    status: '403',
                    code: 'EFORBIDDEN',
                    title: 'Create forbidden'
                });
            });
    }
}

export default function() {
    return {
        resource: userSchema.type,
        handlers: new UserHandler(),
        attributes: {
            ...userSchema.attributes,
            ...userSchema.relationships
        }
    };
}

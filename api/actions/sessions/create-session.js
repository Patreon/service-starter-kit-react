import { create as createStoredSession } from '../../models/session';
import serializeUser from './serialize-user';

export default function createSession(req) {
    return new Promise((resolve, reject) => {
        createStoredSession(req.session, req.body.email, req.body.password)
            .then(({user, session}) => {
                serializeUser(user, req)
                    .then((userJSONAPIData) => {
                        resolve({data: userJSONAPIData, session});
                    })
                    .catch((error) => { reject(error); });
            })
            .catch((error) => { reject(error); });
    });
}

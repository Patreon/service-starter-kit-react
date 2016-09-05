import { get as getUser } from '../../models/user';
import serializeUser from './serialize-user';

export default function getSessionUser(req) {
    return (req.session && req.session.userID) ?
    new Promise((resolve, reject) => {
        getUser(req.session.userID)
            .then((user) => {
                serializeUser(user, req)
                    .then((userJSONAPIData) => {
                        resolve({data: userJSONAPIData});
                    })
                    .catch((error) => { reject(error); });
            })
            .catch((error) => { reject(error); });
    })
    : Promise.resolve({data: null});
}

import bcrypt from 'bcryptjs';
import {findByEmail} from './user';

function checkPassword(inputPassword, dbHash, dbSalt) {
    const hashedInput = bcrypt.hashSync(inputPassword, dbSalt);
    return hashedInput === dbHash;
}

function checkEmailAndPassword(inputEmail, inputPassword) {
    const email = inputEmail ? inputEmail : '';
    const password = inputPassword ? inputPassword : '';
    return new Promise((resolve, reject) => {
        findByEmail(email)
            .then((foundUser) => {
                if (checkPassword(password, foundUser.password, foundUser.salt)) {
                    resolve(foundUser);
                } else {
                    reject({
                        message: 'Email or password did not match',
                        status: 403
                    });
                }
            })
            .catch(() => {
                checkPassword(password, 'prevent timing attacks', bcrypt.genSaltSync(10));
                reject({
                    message: 'Email or password did not match',
                    status: 403
                });
            });
    });
}

export function create(requestSession, email, password) {
    return new Promise((resolve, reject) => {
        checkEmailAndPassword(email, password)
            .then((user) => {
                requestSession.userID = user.id;
                requestSession.isAdmin = user.is_admin;
                resolve({
                    user: user,
                    session: requestSession
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
}

export function destroy(req) {
    return new Promise((resolve) => {
        req.session.destroy(() => {
            req.session = null;
            resolve(null);
        });
    });
}

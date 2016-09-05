import bcrypt from 'bcryptjs';
import * as dbm from './dbm';

export function get(userID) {
    return dbm.get('users', userID);
}

export function findByEmail(email) {
    return dbm.findByUnique('users', 'email', email);
}

export function create(email, password) {
    return new Promise((resolve, reject) => {
        findByEmail(email)
            .then(() => {
                reject({
                    message: 'A user with email ' + email + ' already exists',
                    status: 409
                });
            })
            .catch(() => {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);
                // TODO: created_at
                dbm.create(
                    'users',
                    {
                        email: email,
                        password: hashedPassword,
                        salt: salt
                    },
                    true
                )
                    .then((result) => { resolve(result); })
                    .catch((error) => { reject(error); });
            });
    });
}

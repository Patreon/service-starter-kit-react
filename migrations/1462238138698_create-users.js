exports.up = (pgm) => {
    pgm.createTable(
        'users',
        {
            id: 'id',
            email: {
                type: 'string',
                unique: true
            },
            password: {
                type: 'string'
            },
            salt: {
                type: 'string'
            },
            created_at: {
                type: 'datetime'
            },
            is_admin: {
                type: 'bool',
                default: false
            }
        }
    );
    pgm.createIndex(
        'users',
        'email',
        {
            unique: true
        }
    );
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};

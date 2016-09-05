exports.up = (pgm) => {
    pgm.createTable(
        'widgets',
        {
            id: 'id',
            name: {
                type: 'string',
                unique: true
            },
            description: {
                type: 'string'
            },
            created_at: {
                type: 'datetime'
            }
        }
    );
    pgm.createIndex(
        'widgets',
        'name',
        {
            unique: true
        }
    );
};

exports.down = (pgm) => {
    pgm.dropTable('widgets');
};

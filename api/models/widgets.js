import * as dbm from './dbm';

const TABLE_NAME = 'widgets';

export function get(widgetID) {
    return dbm.get(TABLE_NAME, widgetID);
}

export function create(name, description) {
    const created_at = new Date();
    return dbm.create(
        TABLE_NAME,
        {
            name,
            description,
            created_at,
        }
    );
}

export function count() {
    return dbm.count(TABLE_NAME);
}

export function list() {
    return dbm.list(TABLE_NAME);
}

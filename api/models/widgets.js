import * as dbm from './dbm';

const TABLE_NAME = 'widgets';

export function get(widgetID) {
    return dbm.get(TABLE_NAME, widgetID);
}

export function create(name, description) {
    // TODO: created_at
    return dbm.create(
        TABLE_NAME,
        {
            name,
            description,
        }
    );
}

export function count() {
    return dbm.count(TABLE_NAME);
}

export function list() {
    return dbm.list(TABLE_NAME);
}

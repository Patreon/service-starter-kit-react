import * as dbm from '../models/dbm';
import JSONAPISerializer from './jsonapi-serializer';
import JSONAPIMask from './jsonapi-mask';

export default class PostgresStore {
    serializer = JSONAPISerializer;
    mask = JSONAPIMask;

    /**
    Handlers readiness status. This should be set to `true` once all handlers are ready to process requests.
    */
    ready = false;

    /**
    initialise gets invoked once for each resource that uses this hander.
    In this instance, we're allocating an array in our in-memory data store.
    */
    initialise() {
        this.ready = true;
    }

    _tableName(request) {
        return this.tableName ? this.tableName : request.params.type;
    }

    _paginationParams(request) {
        if (!request.params.page) {
            return {};
        }
        let sortAttribute = undefined;
        let ascending = undefined;
        if (request.params.sort) {
            sortAttribute = ('' + request.params.sort);
            ascending = sortAttribute[0] !== '-';
            if (sortAttribute === '-' || sortAttribute === '+') {
                sortAttribute = sortAttribute.substring(1, sortAttribute.length);
            }
        }
        if (request.params.page.offset !== undefined) {
            return {
                sort: sortAttribute,
                ascending,
                offset: request.params.page.offset,
                pageSize: request.params.page.size
            };
        }
        return {
            sort: sortAttribute,
            ascending,
            cursor: request.params.page.cursor,
            pageSize: request.params.page.size
        };
    }

    _objectToJSON(object, callback, {request, type}) {
        return this.serializer.objectToJSON(object, callback, {request, type});
    }

    _objectFromJSON(inboundJSON) {
        delete inboundJSON.id;
        delete inboundJSON.type;
        delete inboundJSON.meta;
        return inboundJSON;
    }

    /**
    Search for a list of resources, given a resource type.
    */
    search(request, callback) {
        if (!this.mask.canList(request.session)) {
            callback({
                status: '403',
                code: 'EFORBIDDEN',
                title: 'List forbidden'
            });
            return;
        }

        dbm.list(this._tableName(request), this._paginationParams(request))
            .then((results) => {
                const formatPromises = results.map((result) => (
                    new Promise((resolve, reject) => {
                        this._objectToJSON(result, (error, formattedResult) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(formattedResult);
                            }
                        }, {request});
                    })
                ));
                Promise.all(formatPromises)
                    .then((formattedResults) => {
                        callback(null, formattedResults, formattedResults.length);
                    })
                    .catch((error) => {
                        callback(error, null);
                    });
            })
            .catch((error) => {
                callback(error, null);
            });
    }

    /**
    Find a specific resource, given a resource type and and id.
    */
    find(request, callback) {
        dbm.get(this._tableName(request), request.params.id)
            .then((result) => {
                if (!this.mask.canRead(result, request.session)) {
                    callback({
                        status: '403',
                        code: 'EFORBIDDEN',
                        title: 'Read forbidden'
                    });
                    return;
                }
                this._objectToJSON(result, callback, {request});
            })
            .catch((error) => {
                callback(error, null);
            });
    }

    /**
    Create (store) a new resource give a resource type and an object.
    */
    create(request, newResource, callback) {
        if (!this.mask.canCreate(request.session)) {
            callback({
                status: '403',
                code: 'EFORBIDDEN',
                title: 'Create forbidden'
            });
            return;
        }
        const tableData = this._objectFromJSON(newResource, request);
        dbm.create(this._tableName(request), tableData)
            .then((result) => {
                this._objectToJSON(result, callback, {request});
            })
            .catch((error) => {
                callback(error, null);
            });
    }

    /**
    Delete a resource, given a resource type and and id.
    */
    delete(request, callback) {
        dbm.get(this._tableName(request), request.params.id)
            .then((result) => {
                if (!this.mask.canDelete(result, request.session)) {
                    callback({
                        status: '403',
                        code: 'EFORBIDDEN',
                        title: 'Delete forbidden'
                    });
                    return;
                }
                dbm.deleteRow(this._tableName(request), request.params.id)
                    .then(() => {
                        callback();
                    })
                    .catch((error) => {
                        callback(error, null);
                    });
            })
            .catch((error) => {
                callback(error, null);
            });
    }

    /**
    Update a resource, given a resource type and id, along with a partialResource.
    partialResource contains a subset of changes that need to be merged over the original.
    */
    update(request, partialResource, callback) {
        dbm.get(this._tableName(request), request.params.id)
            .then((getResult) => {
                if (!this.mask.canUpdate(getResult, request.session)) {
                    callback({
                        status: '403',
                        code: 'EFORBIDDEN',
                        title: 'Update forbidden'
                    });
                    return;
                }
                const tableData = this._objectFromJSON(partialResource);
                dbm.update(this._tableName(request), request.params.id, tableData)
                    .then((result) => {
                        this._objectToJSON(result, callback, {request});
                    })
                    .catch((error) => {
                        callback(error, null);
                    });
            })
            .catch((error) => {
                callback(error, null);
            });
    }
}

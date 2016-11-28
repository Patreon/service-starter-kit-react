export default class JSONAPISerializer {
    static schema() {
        return {
            attributes: {},
            relationships: {}
        };
    }

    static objectToJSON(object, callback, {request, type}) {
        const promises = [];
        promises.push(this.baseForObject(object, request, type));
        promises.push(this.attributesForObject(object));
        promises.push(this.relationshipsForObject(object));
        return Promise.all(promises)
            .then((values) => {
                const [base, attributes, relationships] = values;
                callback(null, Object.assign({}, base, attributes, relationships));
            })
            .catch((error) => {
                callback(error);
            });
    }

    static baseForObject(object, request, type) {
        let returnType = type;
        if (!type) {
            returnType = request.params.type;
        }
        return {
            id: ('' + object.id),
            type: returnType
        };
    }

    static shouldIncludeAttribute() {
        return true;
    }

    static attributesForObject(object) {
        const returnObject = {};
        Object.keys(this.schema().attributes).forEach((attribute) => {
            if (this.shouldIncludeAttribute(attribute)) {
                returnObject[attribute] = object[attribute];
            }
        });
        return returnObject;
    }

    static shouldIncludeRelationship() {
        return true;
    }

    static relationshipsForObject(object) {
        if (!this.schema().relationships) {
            return {};
        }
        const relationshipKeys = Object.keys(this.schema().relationships).filter((relationshipKey) => (
            this.shouldIncludeRelationship(relationshipKey)
        ));
        const relationshipPromises = relationshipKeys.map((relationshipKey) => (
            this.infoForRelationship(object, relationshipKey)
        ));
        return Promise.all(relationshipPromises)
            .then((relationshipInfos) => {
                return relationshipInfos.reduce((memo, relationshipInfo, index) => {
                    memo[relationshipKeys[index]] = relationshipInfo;
                    return memo;
                }, {});
            });
    }

    static infoForRelationship() {
        return undefined;
    }
}

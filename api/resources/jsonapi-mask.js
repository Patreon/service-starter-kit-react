export default class JSONAPIMask {
    static booleanToPromise(boolean) {
        return new Promise((resolve, reject) => {
            if (boolean) {
                resolve();
            } else {
                reject();
            }
        });
    }

    static canCreate() {
        return this.booleanToPromise(false);
    }

    static canRead() {
        return this.booleanToPromise(false);
    }

    static canUpdate() {
        return this.booleanToPromise(false);
    }

    static canDelete() {
        return this.booleanToPromise(false);
    }

    static canList() {
        // sadly, jsonapi-server uses listing to look up relationships...
        return this.booleanToPromise(true);
    }
}

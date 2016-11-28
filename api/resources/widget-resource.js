import {Joi as types} from 'jsonapi-server/lib/ourJoi';
import JSONAPIHandler from './jsonapi-handler';
import JSONAPISerializer from './jsonapi-serializer';
import JSONAPIMask from './jsonapi-mask';
import * as dbm from '../models/dbm';

const widgetSchema = {
    type: 'widget',
    attributes: {
        name: types.string().required(),
        description: types.string().allow(null),
        created_at: types.date().iso().allow(null),
    },
    relationships: {}
};

class WidgetSerializer extends JSONAPISerializer {
    static schema() {
        return widgetSchema;
    }
}

class WidgetMask extends JSONAPIMask {
    static canCreate(session) {
        return this.booleanToPromise(session && session.isAdmin);
    }

    static canRead() {
        return this.booleanToPromise(true);
    }

    static canUpdate(model, session) {
        return this.booleanToPromise(session && session.isAdmin);
    }

    static canDelete(model, session) {
        return this.booleanToPromise(session && session.isAdmin);
    }
}

class WidgetHandler extends JSONAPIHandler {
    tableName = 'widgets'

    serializer = WidgetSerializer
    mask = WidgetMask
}

export default function() {
    return {
        resource: widgetSchema.type,
        handlers: new WidgetHandler(),
        attributes: {
            ...widgetSchema.attributes,
            ...widgetSchema.relationships
        }
    };
}

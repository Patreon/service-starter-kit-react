import jsonApiUrl from '../middleware/jsonapi/utilities/json-api-url';
import createSuite from '../jsonapi-suites/create-suite';

const defaultFields = ['name', 'description', 'created_at'];
const defaultResponseFormat = {
    fields: {
        widget: defaultFields
    }
};

export const widgetLoadSuite = createSuite(
    'GET_WIDGET',
    (widgetID) => ({
        url: jsonApiUrl(`/widget/${widgetID}`, defaultResponseFormat)
    })
);

export const widgetListSuite = createSuite(
    'GET_WIDGETS',
    () => ({
        url: jsonApiUrl(`/widget`, defaultResponseFormat)
    }),
    false
);

export const widgetSearchSuite = createSuite(
    'GET_FILTERED_WIDGETS',
    (query) => {
        if (query.length > 1) {
            return {
                url: jsonApiUrl(`/widget?filter[name]=:${query}`, defaultResponseFormat)
            };
        }
    },
    false
);

export const widgetCreateSuite = createSuite(
    'POST_WIDGET',
    (name, description) => ({
        url: jsonApiUrl(`/widget`, defaultResponseFormat),
        body: {
            data: {
                type: 'widget',
                attributes: {
                    name,
                    description
                }
            }
        }
    })
);

export const widgetEditSuite = createSuite(
    'PATCH_WIDGET',
    (widgetID, name, description) => {
        return {
            url: jsonApiUrl(`/widget/${widgetID}`, defaultResponseFormat),
            body: {
                data: {
                    type: 'widget',
                    attributes: {
                        name,
                        description
                    }
                }
            }
        };
    }
);

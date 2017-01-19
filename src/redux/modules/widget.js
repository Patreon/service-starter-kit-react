import { jsonApi, buildUrl } from 'libs/nion';

const defaultResponseFormat = {
    fields: {
        widget: ['name', 'description', 'created_at']
    }
};

export const widgetLoadAction = (dataKey) => (widgetID) => (dispatch) => (
    dispatch(jsonApi.get(dataKey, {
        endpoint: buildUrl(
            `/widget/${widgetID}`,
            defaultResponseFormat
        )
    }))
);

export const widgetListAction = (dataKey) => () => (dispatch) => (
    dispatch(jsonApi.get(dataKey, {
        endpoint: buildUrl(
            `/widget`,
            defaultResponseFormat
        )
    }))
);

export const widgetSearchAction = (dataKey) => (query) => (dispatch) => {
    if (query.length > 1) {
        return dispatch(jsonApi.get(dataKey, {
            endpoint: buildUrl(
                `/widget?filter[name]=:${query}`,
                defaultResponseFormat
            )
        }));
    }
};

export const widgetCreateAction = (dataKey) => (name, description) => (dispatch) => (
    dispatch(jsonApi.post(dataKey, {
        endpoint: buildUrl(
            `/widget`,
            defaultResponseFormat
        ),
        body: {
            data: {
                type: 'widget',
                attributes: {
                    name,
                    description
                }
            }
        }
    }))
);

export const widgetEditAction = (dataKey) => (widgetID, name, description) => (dispatch) => (
    dispatch(jsonApi.patch(dataKey, {
        endpoint: buildUrl(
            `/widget/${widgetID}`,
            defaultResponseFormat
        ),
        body: {
            data: {
                type: 'widget',
                attributes: {
                    name,
                    description
                }
            }
        }
    }))
);

export const widgetDeleteAction = (dataKey) => (widgetID) => (dispatch) => (
    dispatch(jsonApi.delete(
        dataKey,
        { type: 'widget', id: widgetID },
        {
            endpoint: buildUrl(
                `/widget/${widgetID}`,
                defaultResponseFormat
            )
        }
    ))
);

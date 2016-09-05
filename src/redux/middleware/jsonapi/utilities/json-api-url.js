import isPlainObject from 'is-plain-object';
import urlBuilder from 'url';
import config from 'config';


export const CURRENT_JSON_API_VERSION = '1.0';

let apiHost = urlBuilder.format({
    protocol: config.api.protocol,
    hostname: config.api.host,
    port: config.api.port,
});
if (apiHost.startsWith('http')) {
    apiHost = apiHost.slice(apiHost.indexOf('://') + 3);
}

const DEFAULT_API_PREFIX = '';
let apiPrefix = DEFAULT_API_PREFIX;
if (config.api.prefix) {
    apiPrefix = config.api.prefix;
}

const _encode = value => Array.isArray(value) && !value.length ? '[]' : encodeURI(value);

const encodeParam = (value, key) => {
    if (isPlainObject(value)) {
        return Object.keys(value).reduce((memo, _key) => {
            return `${memo}${key}[${_key}]=${_encode(value[_key])}&`;
        }, '');
    }
    return `${key}=${_encode(value)}&`;
};

const encodeParams = (params) => {
    if (!params) return '';
    return Object.keys(params).reduce((memo, key) =>
        `${memo}${encodeParam(params[key], key)}`
    , '');
};

export default function(url, _params, _apiHost = apiHost) {
    const separator = url.includes('?') ? '&' : '?';

    const params = _params
        ? encodeParams(_params)
        : '';

    const path = `${url}${separator}` + params;

    const prefixedPath = `${apiPrefix}${path}`;

    return apiHost ?
    `${config.api.protocol}://${_apiHost}${prefixedPath}`
    : prefixedPath;
}

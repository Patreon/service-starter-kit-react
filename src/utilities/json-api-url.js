import urlBuilder from 'url';
import config from 'config';
import urlFactory from 'url-factory';


let apiHost = config.api.host ? urlBuilder.format({
    protocol: config.api.protocol,
    hostname: config.api.host,
    port: config.api.port,
}) : null;

const DEFAULT_API_PREFIX = '';
let apiPrefix = DEFAULT_API_PREFIX;
if (config.api.prefix) {
    apiPrefix = config.api.prefix;
}
apiHost = `${apiHost}${apiPrefix}`;

export default urlFactory(apiHost);

export const urlBuilderForDefaults = (defaults) => (
    urlFactory(apiHost, defaults)
);

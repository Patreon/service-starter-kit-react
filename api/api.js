import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../src/config';
import * as actions from './actions/index';
import {mapUrl} from 'utils/url.js';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';
import redisStoreMaker from 'connect-redis';
import urlParse from 'url-parse';

const pretty = new PrettyError();
const app = express();

const server = new http.Server(app);

const io = new SocketIo(server);
io.path('/ws');

const sessionOptions = {
    secret: 'TODO: REPLACE THIS SECRET PLZ',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: (30 * 24 * 60 * 60 * 1000) }
};
if (process.env.NODE_ENV === 'production') {
    const RedisSessionStore = redisStoreMaker(session);
    const parsedURL = urlParse(process.env.REDIS_URL);
    sessionOptions.store = new RedisSessionStore({
        host: parsedURL.hostname,
        port: parsedURL.port,
        pass: parsedURL.password
    });
} else {
    sessionOptions.store = new session.MemoryStore;
}
app.use(session(sessionOptions));
app.use(bodyParser.json());


app.use((req, res, next) => {
    const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);

    const {action, params} = mapUrl(actions, splittedUrlPath);

    if (action) {
        action(req, params)
        .then((result) => {
            if (result instanceof Function) {
                result(res);
            } else {
                res.json(result);
            }
        }, (reason) => {
            if (reason && reason.redirect) {
                res.redirect(reason.redirect);
            } else {
                console.error('API ERROR:', pretty.render(reason));
                res.status(reason.status || 500).json(reason);
            }
        });
    } else {
        next();
    }
});

const bootstrapJsonApi = (expressApp, jsonAPIConfig) => {
    // Find the express module in the NodeJS internal cache
    const expressModule = Object.keys(require.cache).filter((cacheKey) => {
        return cacheKey.match('/node_modules/express/index.js');
    }).pop();
    // Alter the expressJs constructor to return your existing instance
    // preventing jsonapi-server from trying to build a new one
    require.cache[expressModule].exports = () => {
        return expressApp;
    };
    // Now load jsonapi-server, which will require express and call The
    // constructor, which now returns your existing express instance
    const jsonApi = require('jsonapi-server');
    jsonApi.setConfig(jsonAPIConfig);

    // TODO: find all ./resources/*-resource
    jsonApi.define(require('./resources/user-resource').default());
    jsonApi.define(require('./resources/widget-resource')());

    require('jsonapi-server/lib/routes/index.js').register();
};

// this setup's routing of :3000/api => :3030/ confuses jsonapi-server
// we tried setting it up with port 3030 directly, but that caused cookies to :(
// so instead we have /api appended to the url constructor *without* being a base
let prefixHackedHostname = config.api.host;
let prefixHackedPort = config.api.port;
if (config.api.prefix) {
    if (config.api.port) {
        prefixHackedPort += config.api.prefix;
    } else {
        prefixHackedHostname += config.api.prefix;
    }
}
const jsonAPIConfig = {
    protocol: config.api.protocol,
    hostname: prefixHackedHostname,
    port: prefixHackedPort,
    base: '/',
};
bootstrapJsonApi(app, jsonAPIConfig);

const bufferSize = 100;
const messageBuffer = new Array(bufferSize);
let messageIndex = 0;

if (config.apiPort) {
    const runnable = app.listen(config.apiPort, (err) => {
        if (err) {
            console.error(err);
        }
        console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
        console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
    });

    io.on('connection', (socket) => {
        socket.emit('news', {msg: `'Hello World!' from server`});

        socket.on('history', () => {
            for (let index = 0; index < bufferSize; index++) {
                const msgNo = (messageIndex + index) % bufferSize;
                const msg = messageBuffer[msgNo];
                if (msg) {
                    socket.emit('msg', msg);
                }
            }
        });

        socket.on('msg', (data) => {
            data.id = messageIndex;
            messageBuffer[messageIndex % bufferSize] = data;
            messageIndex++;
            io.emit('msg', data);
        });
    });
    io.listen(runnable);
} else {
    console.error('==>     ERROR: No PORT environment variable has been specified');
}

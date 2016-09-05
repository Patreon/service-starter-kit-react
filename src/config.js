require('babel-polyfill');

const environment = {
    development: {
        isProduction: false,
        api: {
            protocol: 'http',
            host: 'localhost',
            port: '3000',
            prefix: '/api'
        }
    },
    production: {
        isProduction: true,
        api: {
            protocol: 'http',
            // host: 'your-url.herokuapp.com',
            prefix: '/api'
        }
    }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT,
    apiHost: process.env.APIHOST || 'localhost',
    apiPort: process.env.APIPORT,
    app: {
        title: 'React/Redux/JSON:API Starter Kit',
        description: 'All the modern best practices in one example.',
        head: {
            titleTemplate: 'React/Redux/JSON:API Starter Kit: %s',
            meta: [
                {name: 'description', content: 'All the modern best practices in one example.'},
                {charset: 'utf-8'},
                {property: 'og:site_name', content: 'React/Redux/JSON:API Starter Kit'},
                // {property: 'og:image', content: 'your-logo.jpg'},
                {property: 'og:locale', content: 'en_US'},
                {property: 'og:title', content: 'React/Redux/JSON:API Starter Kit'},
                {property: 'og:description', content: 'All the modern best practices in one example.'},
                {property: 'og:card', content: 'summary'},
                {property: 'og:site', content: '@21echoes'},
                {property: 'og:creator', content: '@21echoes'},
                {property: 'og:image:width', content: '200'},
                {property: 'og:image:height', content: '200'}
            ]
        }
    },

}, environment);

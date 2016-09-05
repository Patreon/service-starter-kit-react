# 21echoes's Starter kit

Forked from erikras's starter kit. Adds JSON-API support, db integration (incl. easy migrations) and easy heroku deploys.


## Development

1. make sure node and npm are installed
1. `npm install`
1. make sure postgres is installed
1. `psql postgres < db-init.sql >/dev/null`
1. `./migrate_local.sh`


## Deployment

### Heroku

1. Create heroku app, add heroku remote, etc.
1. Add Postgres and Redis
1. Set the following heroku config vars
    1. PG_USER: (user from heroku pg settings)
    1. PG_PASS: (password from heroku pg settings)
    1. NPM_CONFIG_PRODUCTION: false
    1. NODE_PATH: ./src
    1. NODE_ENV: production
    1. DATABASE_URL: (should already be set)
    1. REDIS_URL: (should already be set)
1. Update `src/config.js`

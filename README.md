# 21echoes's Starter kit

Forked from erikras's starter kit. Adds JSON-API support, db integration (incl. easy migrations) and easy heroku deploys.


## Development

1. make sure node and npm are installed
1. `npm install`
1. make sure postgres is installed
1. rename the db in `db-init.sql` and `.env` (find/replace `my_react_starter_kit`)
1. `psql postgres < db-init.sql >/dev/null`
1. `./migrate_local.sh`

Now you can start developing!

1. `npm run dev`
1. visit `localhost:3000`

As you change code, the server will auto-reboot and/or auto-hot-reload (swaps out React components without needing a browser refresh)


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
1. Update `src/config.js` to have the proper `production.api.host` (where it currently says "your-url.herokuapp.com")
1. `./migrate_remote.sh`

# configure-store

Configures a redux store with sensible default reducers and any provided
reducers and middleware.

- [usage](#usage)
  - [reducers](#reducers)
  - [options](#options)
    - [router](#router)
    - [responsive](#responsive)
    - [data](#data)
- [middleware](#middleware)
  - [redux-thunk](#redux-thunk)
  - [redux-api-middleware](#redux-api-middleware)

## example

```js
import configureStore from 'configure-store'
import reducers from './reducers' // plain object of reducers

const store = configureStore(reducers)
console.log(store.getState())
```

```js
{
    browser: { ... },
    data: { ... },
    routing: { ... },
    // any additional reducers you provide
}
```

## usage

```
configureStore(
    reducers: Object,
    [options: Object],
    [extraMiddleware: Array],
    [initialState: Objects]
)
```

### reducers
Plain object of reducers.

```
{ myReducer: () => {} }
```

### options

Configure defaults included w/ configureStore

```js
{
    router: true,
    responsive: true,
    data: true
}
```

#### `router`

When enabled your store will be setup with
[react-router-redux](https://github.com/reactjs/react-router-redux) which
keeps the `routing` slice of your state in sync w/
[react-router](https://github.com/reactjs/react-router) if you're using it.

#### `responsive`

When enabled your store will be set up with
[redux-responsive](https://github.com/AlecAivazis/redux-responsive) which provides
some useful browser/viewport data on the `browser` slice of state for use in layouts.
We currently support three breakpoints: `extraSmall`, `small`, `medium`.

You can now render alternate layouts by selecting something like:

```js
if (state.browser.greaterThan.medium) {
    return <Desktop />
} else {
    return <Mobile />
}
```

Their [readme](https://github.com/AlecAivazis/redux-responsive#the-responsive-state)
contains more docs on what's available on `state.browser`.

#### `data`

Data should be included if you're utilizing any actions and reducers that interface with
[api.patreon.com](https://api.patreon.com). This will add the `data` slice to your state which
contains all resources returned in an API response indexed by resource type and id. So if you
make a request that responds w/ a payload containing a user and a campaign your `data` would
widget something like:

```js
data: {
    _fetchedAt: 1458942217146,
    campaign: {
        9876: { id: '9876' ... }
    },
    user: {
        1234: {
            id: '1234',
            relationships: {
                campaign: { id: '9876', type: 'campaign' }
            }
        }
    }
}
```

### middleware

`configureStore` provides you some useful middleware you can take advantage of when
creating reducers and actions.

#### `redux-thunk`

[redux-thunk](https://github.com/gaearon/redux-thunk), a commonly used redux middleware,
allows you to write action creators that return a function instead of an action.

This allows you to dispatch subsequent actions at a later time (eg in a timer or network response handler).

*example*

```js
function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(increment());
    }, 1000);
  };
}
```

#### `redux-api-middleware`

[redux-api-middleware](https://github.com/agraboso/redux-api-middleware) provides some sensible default
actions when making REST API calls. It's not specific to [api.patreon.com](https://api.patreon.com) so
you can leverage this when interfacing w/ third party APIs or older routes.

By dispatching a specific type of action (a
[RSAA](https://github.com/agraboso/redux-api-middleware#redux-standard-api-calling-actions) `REQUEST` action) this middleware will make the network call
on your behalf and dispatch subsequent `SUCCESS` and `FAILURE` actions for you to handle.

Definitely check out the [introduction section](https://github.com/agraboso/redux-api-middleware#introduction) in
their readme for more info.

*example*

```js
import { CALL_API } from `redux-api-middleware`;

{
  [CALL_API]: {
    endpoint: 'http://www.example.com/api/users',
    method: 'GET',
    types: ['REQUEST', 'SUCCESS', 'FAILURE']
  }
}
```

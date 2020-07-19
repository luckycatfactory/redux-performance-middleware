[![codecov](https://codecov.io/gh/luckycatfactory/redux-performance-middleware/branch/master/graph/badge.svg)](https://codecov.io/gh/luckycatfactory/redux-performance-middleware)
[![npm version](https://badge.fury.io/js/%40luckycatfactory%2Fredux-performance-middleware.svg)](https://badge.fury.io/js/%40luckycatfactory%2Fredux-performance-middleware)

# `redux-performance-middleware`

This package supplies a lightweight middleware that gives you observability of your Redux reducer's performance.

## Example

You can see an example of this middleware in use [here](https://codesandbox.io/s/redux-performance-middleware-example-03zkr?file=/src/index.js).

## Installation

With `yarn`:

```sh
yarn add @luckycatfactory/redux-performance-middleware
```

With `npm`:

```sh
npm install @luckycatfactory/redux-performance-middleware --save
```

## Usage

It's easy to use the middleware.
All you have to do is pass a callback on initialization:

```js
import reduxPerformanceMiddleware from '@luckycatfactory/redux-performance-middleware';

const logActionPerformance = ({ action, elapsedTime }) => {
  // Maybe you just want a warning in the console.
  if (elapsedTime > 10) {
    customLogger('Warning: slow reducer action observed for the following action:', action);
  }
  // Or maybe you want to use distribution metrics of some kind to get a larger
  // picture of your Redux performance.
  customDistributionMetric({
    metric: 'redux_performance',
    tags: [`action_type:${action.type}`],
    value: elapsedTime,
  });
}

const middleware = reduxPerformanceMiddleware(logActionPerformance);

const store = createStore(myReducer, applyMiddleware(middleware));
```

If you want to only use the middleware in development, you should do the following to prevent the package from being included in your bundle:

```js
import reduxPerformanceMiddleware from '@luckycatfactory/redux-performance-middleware';

const middleware = [/* other middleware */];

if (process.env.NODE_ENV === 'development') {
  const logActionPerformance = ({ action, elapsedTime }) => {
    //...
  };

  const performanceMiddleware = reduxPerformanceMiddleware(logActionPerformance);

  middleware.push(performanceMiddleware);
}

const store = createStore(myReducer, applyMiddleware(...middleware));
```

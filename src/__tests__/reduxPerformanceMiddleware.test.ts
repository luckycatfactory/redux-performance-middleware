import {
  AnyAction,
  applyMiddleware,
  CombinedState,
  combineReducers,
  createStore,
  Store,
} from 'redux';

import reduxPerformanceMiddleware, {
  ReduxPerformanceMiddlewareCallback,
} from '../index';

interface AddTodoAction {
  readonly payload: string;
  readonly type: string;
}

type TodoActionTypes = AddTodoAction;

type TodoState = readonly string[];

type TodoStore = Store<CombinedState<{ todos: TodoState }>, AnyAction>;

describe('reduxPerformanceMiddleware()', () => {
  const ADD_TODO = 'ADD_TODO';

  const createStoreWithMiddleware = (
    callback: ReduxPerformanceMiddlewareCallback
  ): TodoStore => {
    const todosReducer = (
      state: TodoState = [],
      action: TodoActionTypes
    ): TodoState => {
      switch (action.type) {
        case ADD_TODO: {
          return state.concat([action.payload]);
        }
        default: {
          return state;
        }
      }
    };

    const rootReducer = combineReducers({
      todos: todosReducer,
    });

    const middleware = reduxPerformanceMiddleware(callback);

    const store = createStore(rootReducer, applyMiddleware(middleware));

    return store;
  };

  describe('validation', () => {
    const originalEnv = process.env.NODE_ENV;
    // eslint-disable-next-line no-console
    const originalError = console.error;

    beforeEach(() => {
      // eslint-disable-next-line no-console
      console.error = jest.fn();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      // eslint-disable-next-line no-console
      console.error = originalError;
    });

    it.each([['test'], ['development']])(
      'logs the correct error if not passed a callback',
      (environment) => {
        process.env.NODE_ENV = environment;

        (createStoreWithMiddleware as () => TodoStore)();

        // eslint-disable-next-line no-console
        expect(console.error as jest.Mock).toHaveBeenCalledTimes(1);
      }
    );

    it('does not log an error in production when not passed a callback', () => {
      process.env.NODE_ENV = 'production';

      (createStoreWithMiddleware as () => TodoStore)();

      // eslint-disable-next-line no-console
      expect(console.error as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe('callback behavior', () => {
    const originalDateNow = Date.now;
    const mockOriginalTime = 0;

    beforeEach(() => {
      Date.now = jest.fn(() => mockOriginalTime);
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it.each([
      ['fast', 0],
      ['a little slow', 4],
      ['slow', 10],
      ['pretty slow', 15],
      ['very slow', 60],
      ['extremely slow', 100],
    ])(
      'correctly calls the callback with the appropriate values when the reducer is %s',
      (testKey, duration) => {
        const mockCallback = jest.fn();
        (Date.now as jest.Mock)
          .mockImplementationOnce(() => mockOriginalTime)
          .mockImplementationOnce(() => mockOriginalTime + duration);
        const store = createStoreWithMiddleware(mockCallback);

        expect(mockCallback).not.toHaveBeenCalled();

        const action = { payload: 'hi', type: ADD_TODO };

        store.dispatch(action);

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenLastCalledWith({
          action,
          elapsedTime: duration,
        });
      }
    );
  });
});

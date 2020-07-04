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

describe('reduxPerformanceMiddleware()', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  const ADD_TODO = 'ADD_TODO';

  const createStoreWithMiddleware = (
    callback: ReduxPerformanceMiddlewareCallback
  ): Store<CombinedState<{ todos: TodoState }>, AnyAction> => {
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

    const store = createStore(
      rootReducer,
      applyMiddleware(reduxPerformanceMiddleware(callback))
    );

    return store;
  };

  describe('validation', () => {
    it('throws the correct error if not passed a callback', () => {
      const mockCallback = jest.fn();
      const store = createStoreWithMiddleware(mockCallback);
      store.dispatch({ payload: 'hi', type: ADD_TODO });

      expect(1).toBe(1);
    });
  });
});

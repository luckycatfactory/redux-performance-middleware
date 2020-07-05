import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';

export type Middleware<S, E extends AnyAction> = (
  api: Dispatch<E> extends Dispatch<AnyAction>
    ? MiddlewareAPI<Dispatch<E>, S>
    : never
) => (next: Dispatch<E>) => (event: E) => ReturnType<Dispatch<E>>;

export interface ReduxPerformanceMiddlewareCallbackParameters {
  readonly action: object;
  readonly elapsedTime: number;
}

export type ReduxPerformanceMiddlewareCallback = (
  parameters: ReduxPerformanceMiddlewareCallbackParameters
) => void;

function reduxPerformanceMiddleware<S, E extends AnyAction>(
  callback: ReduxPerformanceMiddlewareCallback
): Middleware<S, E> {
  const hasCallback = Boolean(callback);

  if (process.env.NODE_ENV !== 'production') {
    if (!hasCallback) {
      // eslint-disable-next-line no-console
      console.error(
        'Expected reduxPerformanceMiddleware to be invoked with a callback, but it was not.'
      );
    }
  }

  const middleware = () => (next: Dispatch<E>) => (
    action: E
  ): ReturnType<Dispatch<E>> => {
    const now = Date.now();

    const result = next(action);

    const elapsedTime = Date.now() - now;

    hasCallback && callback({ action, elapsedTime });

    return result;
  };

  return middleware;
}

export default reduxPerformanceMiddleware;

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';

type Middleware<S, E extends AnyAction> = (
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

function noOp(): void {
  return;
}

function reduxPerformanceMiddleware<S, E extends AnyAction>(
  callback: ReduxPerformanceMiddlewareCallback = noOp
): Middleware<S, E> {
  const middleware = () => (next: Dispatch<E>) => (
    action: E
  ): ReturnType<Dispatch<E>> => {
    const now = Date.now();

    const result = next(action);

    const elapsedTime = Date.now() - now;

    callback({ action, elapsedTime });

    return result;
  };

  return middleware;
}

export default reduxPerformanceMiddleware;

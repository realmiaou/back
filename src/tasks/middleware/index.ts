import { FunctionBuilder } from 'firebase-functions'
import { TaskContext } from 'firebase-functions/lib/common/providers/tasks'
import { Middleware, Next } from './index.type'

export * from './sentry'

export const task = (tasks: FunctionBuilder['tasks']) =>
  (middlewares: Middleware[]) => <T>() => (fn: (data: T, context: TaskContext) => PromiseLike<any> | any) =>
    tasks.taskQueue().onDispatch(
      withOnCallMiddlewares(middlewares, (data, context) =>
        fn(data as T, context)
      ))

const withOnCallMiddlewares =
  (middlewares: Middleware[], handler: Next): Next =>
    (data, context) => {
      const chainMiddlewares = ([
        firstMiddleware,
        ...restOfMiddlewares
      ]: Middleware[]): Next =>
        firstMiddleware
          ? (data, context): ReturnType<Next> =>
              firstMiddleware(data, context, chainMiddlewares(restOfMiddlewares))
          : handler
      return chainMiddlewares(middlewares)(data, context)
    }

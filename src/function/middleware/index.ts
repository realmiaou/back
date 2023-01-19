import { Parameter, UserId } from '@miaou/types'
import { FunctionBuilder, https } from 'firebase-functions'
import { Middleware, Next } from './index.type'

export * from './admin'
export * from './app-check'
export * from './authenticated'
export * from './date-serializer'
export * from './sentry'

export const typedOnCallWithMiddlewares = (https: FunctionBuilder['https']) =>
  <T extends (...args: any) => any, CONTEXT = https.CallableContext>(
    middlewares: Middleware<Parameter<T>>[]
  ) =>
    (
      fn: (
      data: Parameter<T>,
      userId: UserId,
      context: CONTEXT
    ) => ReturnType<T>
    ) =>
      https.onCall(
        withOnCallMiddlewares(middlewares, (data, context) =>
          fn(data, (context.auth?.uid ?? 'guest') as UserId, context as CONTEXT)
        )
      )

const withOnCallMiddlewares =
    <T>(middlewares: Middleware<T>[], handler: Next<T>): Next<T> =>
    (data, context) => {
      const chainMiddlewares = ([
        firstMiddleware,
        ...restOfMiddlewares
      ]: Middleware<T>[]): Next<T> =>
        firstMiddleware
          ? (data, context): ReturnType<Next<T>> =>
              firstMiddleware(data, context, chainMiddlewares(restOfMiddlewares))
          : handler
      return chainMiddlewares(middlewares)(data, context)
    }

import { Parameter, UserId } from '@miaou/types'
import {
  CallableRequest,
  HttpsOptions,
  onCall
} from 'firebase-functions/v2/https'
import { Middleware, Next } from './index.type'

export * from './admin'
export * from './app-check'
export * from './authenticated'
export * from './date-serializer'
export * from './sentry'

export const typedOnCallWithMiddlewares = (onCallInstance: typeof onCall, defaultOptions = {} as HttpsOptions) =>
  <T extends (...args: any) => any, CONTEXT = CallableRequest>(
    middlewares: Middleware<Parameter<T>>[]
  ) =>
    (
      fn: (
      data: Parameter<T>,
      userId: UserId,
      context: CONTEXT
    ) => ReturnType<T>,
      options = defaultOptions as HttpsOptions
    ) =>
      onCallInstance(
        { ...defaultOptions, ...options },
        withOnCallMiddlewares(middlewares, context =>
          fn(context.data, (context.auth?.uid ?? 'guest') as UserId, context as CONTEXT)
        )
      )

const withOnCallMiddlewares =
    <T>(middlewares: Middleware<T>[], handler: Next<T>): Next<T> =>
    (context) => {
      const chainMiddlewares = ([
        firstMiddleware,
        ...restOfMiddlewares
      ]: Middleware<T>[]): Next<T> =>
        firstMiddleware
          ? (context): ReturnType<Next<T>> =>
              firstMiddleware(context, chainMiddlewares(restOfMiddlewares))
          : handler
      return chainMiddlewares(middlewares)(context)
    }

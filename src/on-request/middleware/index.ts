import { FunctionBuilder } from 'firebase-functions'
import { Middleware, Next, Request, Response } from './index.type'

export * from './sentry'

export const typedOnCallWithMiddlewares = (https: FunctionBuilder['https']) =>
  (middlewares: Middleware[]) =>
    (fn: (request:Request, response: Response) => void | Promise<void>) =>
      https.onRequest(withOnCallMiddlewares(middlewares, fn))

const withOnCallMiddlewares =
    (middlewares: Middleware[], handler: Next): Next =>
      (request, response) => {
        const chainMiddlewares = ([firstMiddleware, ...restOfMiddlewares]: Middleware[]): Next =>
          firstMiddleware
            ? (request, response): void | Promise<void> =>
                firstMiddleware(request, response, chainMiddlewares(restOfMiddlewares))
            : handler
        return chainMiddlewares(middlewares)(request, response)
      }

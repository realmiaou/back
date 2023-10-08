import { onRequest } from 'firebase-functions/v2/https'
import { Middleware, Next, Request, Response } from './index.type'

export * from './sentry'

export const onRequestV2Wrapper = (instance: typeof onRequest) =>
  (middlewares: Middleware[]) =>
    (fn: (request:Request, response: Response) => void | Promise<void>) =>
      instance(withOnCallMiddlewares(middlewares, fn))

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

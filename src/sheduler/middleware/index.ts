import { FunctionBuilder } from 'firebase-functions'
import { EventContext } from 'firebase-functions/lib/cloud-functions'
import { Middleware, Next } from './index.type'

export * from './sentry'

export const typedOnPublishPubsubWithMiddlewares = (pubsub: FunctionBuilder['pubsub']) =>
  (middlewares: Middleware[]) => (schedule: string, timezone = 'Europe/Paris') => (fn: (context: EventContext) => PromiseLike<any> | any) =>
    pubsub.schedule(schedule).timeZone(timezone).onRun(
      withOnCallMiddlewares(middlewares, context =>
        fn(context)
      )
    )

const withOnCallMiddlewares =
    (middlewares: Middleware[], handler: Next): Next =>
      (context) => {
        const chainMiddlewares = ([
          firstMiddleware,
          ...restOfMiddlewares
        ]: Middleware[]): Next =>
          firstMiddleware
            ? (context): ReturnType<Next> =>
                firstMiddleware(context, chainMiddlewares(restOfMiddlewares))
            : handler
        return chainMiddlewares(middlewares)(context)
      }

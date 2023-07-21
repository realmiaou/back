import { FunctionBuilder } from 'firebase-functions'
import { EventContext } from 'firebase-functions/lib/cloud-functions'
import { Middleware, Next } from './index.type'

export * from './sentry'

export const pubsubWrapper = (pubsub: FunctionBuilder['pubsub']) =>
  (middlewares: Middleware[]) => <T>(topic: string) => (fn: (message: T, context: EventContext) => PromiseLike<any> | any) =>
    pubsub.topic(topic).onPublish(
      withOnCallMiddlewares(middlewares, (message, context) =>
        fn(message.attributes as T, context)
      )
    )

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

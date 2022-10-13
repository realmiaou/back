import { Change, FunctionBuilder } from 'firebase-functions'
import { DocumentSnapshot } from 'firebase-admin/firestore'
import { UserId } from '@miaou/types'
import { Middleware, Next } from './index.type'

export * from './date-serializer'
export * from './sentry'

export const typedOnWriteTriggerWithMiddlewares = (trigger: FunctionBuilder['firestore']) =>
  (middlewares: Middleware[]) =>
  <T>(
      path: string,
      fn: (data: Change<DocumentSnapshot<T>>, userId: UserId) => void
    ) =>
      trigger
        .document(path)
        .onWrite(
          withOnCallMiddlewares(middlewares, data =>
            fn(data as Change<DocumentSnapshot<T>>, 'system')
          )
        )

export const typedOnUpdateTriggerWithMiddlewares = (trigger: FunctionBuilder['firestore']) =>
  (middlewares: Middleware[]) =>
  <T>(
      path: string,
      fn: (data: Change<DocumentSnapshot<T>>, userId: UserId) => void
    ) =>
      trigger
        .document(path)
        .onUpdate(
          withOnCallMiddlewares(middlewares, data =>
            fn(data as Change<DocumentSnapshot<T>>, 'system')
          )
        )

export const typedOnDeleteTriggerWithMiddlewares = (trigger: FunctionBuilder['firestore']) =>
  (middlewares: Middleware[]) =>
        <T>(
      path: string,
      fn: (data: DocumentSnapshot<T>, userId: UserId) => void
    ) =>
      trigger
        .document(path)
        .onDelete(
          withOnCallMiddlewares(middlewares, data =>
            fn(data as DocumentSnapshot<T>, 'system')
          )
        )
export const typedOnCreateTriggerWithMiddlewares = (trigger: FunctionBuilder['firestore']) =>
  (middlewares: Middleware[]) =>
        <T>(
      path: string,
      fn: (data: DocumentSnapshot<T>, userId: UserId) => void
    ) =>
      trigger
        .document(path)
        .onCreate(
          withOnCallMiddlewares(middlewares, data =>
            fn(data as DocumentSnapshot<T>, 'system')
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

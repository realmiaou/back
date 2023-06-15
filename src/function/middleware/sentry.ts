import Sentry from '@sentry/node'
import { flatten } from 'flat'
import { Middleware } from './index.type'

export type SentryInstance = typeof Sentry

export const sentry = (sentry: SentryInstance) : Middleware<any> => async (context, next) => {
  const userId = context.auth?.uid ?? 'guest'
  sentry.setUser({ id: userId })
  const transaction = sentry.startTransaction({
    name: process.env.FUNCTION_TARGET!,
    op: 'firebase.function.onCall',
    data: { ...flatten(context.data ?? {}), uid: userId }
  })
  sentry.configureScope((scope) => {
    scope.setSpan(transaction)
  })
  try {
    return await next(context)
  } catch (e) {
    console.error(e)
    sentry.captureException(e)
    await sentry.flush(1000)
    throw e
  } finally {
    transaction?.finish()
    await sentry.flush(1000)
  }
}

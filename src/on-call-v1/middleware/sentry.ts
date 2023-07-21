import Sentry from '@sentry/node'
import flatten from 'flat'
import { Middleware } from './index.type'

type SentryInstance = typeof Sentry

export const onCallV1Sentry = (sentry: SentryInstance) : Middleware<any> => async (data, context, next) => {
  const userId = context.auth?.uid ?? 'guest'
  sentry.setUser({ id: userId })
  const transaction = sentry.startTransaction(
    { name: process.env.FUNCTION_TARGET! },
    { ...flatten(data ?? {}) as Record<string, any>, uid: userId }
  )
  sentry.configureScope((scope) => {
    scope.setSpan(transaction)
  })
  try {
    return await next(data, context)
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

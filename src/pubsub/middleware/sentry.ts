import { logger } from 'firebase-functions'
import Sentry from '@sentry/node'
import flatten from 'flat'
import { Middleware } from './index.type'

type SentryInstance = typeof Sentry

export const pubsubSentry = (sentry: SentryInstance) : Middleware => async (data, context, next) => {
  sentry.setUser({ id: 'system' })
  const transaction = sentry.startTransaction(
    { name: process.env.FUNCTION_TARGET! },
    { ...flatten(context ?? {}) as Record<string, any>, uid: 'system' }
  )
  sentry.configureScope((scope) => {
    scope.setSpan(transaction)
  })
  try {
    return await next(data, context)
  } catch (e) {
    logger.error(e)
    sentry.captureException(e)
    await sentry.flush(1000)
    throw e
  } finally {
    transaction?.finish()
    await sentry.flush(1000)
  }
}

import flattenDeep from 'lodash/flattenDeep'
import { logger } from 'firebase-functions'
import Sentry from '@sentry/node'
import { Middleware } from './index.type'

export type SentryInstance = typeof Sentry

export const sentry = (sentry: SentryInstance) : Middleware => async (data, context, next) => {
  sentry.setUser({ id: 'system' })
  const transaction = sentry.startTransaction({
    name: process.env.FUNCTION_TARGET!,
    op: 'firebase.function.pubsub',
    data: { ...flattenDeep([context]), uid: 'system' }
  })
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

import flatten from 'flat'
import Sentry from '@sentry/node'
import { Middleware } from './index.type'

type SentryInstance = typeof Sentry

export const onRequestSentry = (sentry: SentryInstance) : Middleware => async (request, response, next) => {
  const transaction = sentry.startTransaction(
    { name: process.env.FUNCTION_TARGET! },
    { ...flatten(request ?? {}) as Record<string, any> }
  )
  sentry.configureScope((scope) => {
    scope.setSpan(transaction)
  })
  try {
    return await next(request, response)
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

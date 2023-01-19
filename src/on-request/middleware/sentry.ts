import flattenDeep from 'lodash.flattendeep'
import Sentry from '@sentry/node'
import { Middleware } from './index.type'

export type SentryInstance = typeof Sentry

export const sentry = (sentry: SentryInstance) : Middleware => async (request, response, next) => {
  const transaction = sentry.startTransaction({
    name: process.env.FUNCTION_TARGET!,
    op: 'firebase.function.onRequest',
    data: { ...flattenDeep([request] ?? []) }
  })
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

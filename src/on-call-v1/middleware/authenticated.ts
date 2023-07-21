import { Middleware } from './index.type'

export const onCallV1Authenticated: Middleware<any> = (data, context, next) => {
  if (!context.auth) throw new Error('No authenticated user')
  return next(data, context)
}

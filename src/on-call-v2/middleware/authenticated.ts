import { Middleware } from './index.type'

export const onCallV2Authenticated: Middleware<any> = (context, next) => {
  if (!context.auth) throw new Error('No authenticated user')
  return next(context)
}

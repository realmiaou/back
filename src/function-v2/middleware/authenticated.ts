import { Middleware } from './index.type'

export const authenticated: Middleware<any> = (context, next) => {
  if (!context.auth) throw new Error('No authenticated user')
  return next(context)
}

import { Middleware } from './index.type'

export const appCheck = (isProduction: boolean) : Middleware<any> => (context, next) => {
  if (isProduction && context.app === undefined)
    throw new Error('The function must be called from an App Check verified app.')
  return next(context)
}

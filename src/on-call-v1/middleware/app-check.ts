import { Middleware } from './index.type'

export const onCallV1AppCheck = (isProduction: boolean) : Middleware<any> => (data, context, next) => {
  if (isProduction && context.app === undefined)
    throw new Error('The function must be called from an App Check verified app.')
  return next(data, context)
}

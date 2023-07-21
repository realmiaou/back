import { UserId } from '@miaou/types'
import { Middleware } from './index.type'

export const onCallV1Admin = (isUserAdmin: (id: UserId) => Promise<boolean>) : Middleware<any> => async (data, context, next) => {
  if (!context.auth) throw new Error('No authenticated user')
  const { uid } = context.auth
  const isAdmin = await isUserAdmin(uid as UserId)
  if (!isAdmin) throw new Error('Not authorized user')
  return next(data, context)
}

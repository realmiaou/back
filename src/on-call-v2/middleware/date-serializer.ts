import { deserializeDate, serializeDate } from '../../date'
import { Middleware } from './index.type'

export const onCallV2DateSerializer: Middleware<any> = async (context, next) => {
  const dataWithSerializedDate = deserializeDate(context.data)
  const result = await next({ ...context, data: dataWithSerializedDate })
  return serializeDate(result)
}

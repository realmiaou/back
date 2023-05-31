import dayjs from 'dayjs'
import { Middleware } from './index.type'

export const dateSerializer: Middleware<any> = async (context, next) =>
  serializeDate(await next(deserializeDate(context.data)))

const serializeDate = <T>(obj: any): any => {
  if (!obj) return obj
  if (Array.isArray(obj)) return obj.map(serializeDate)
  if (!(obj instanceof Object)) return obj
  return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
    const value = obj[key]
    acc[key] = value instanceof Date
      ? value.toISOString()
      : value instanceof Object
        ? serializeDate(value)
        : value
    return acc
  }, {}) as T
}

const isISODate =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

const deserializeDate = <T>(obj: any): any => {
  if (!obj) return obj
  if (Array.isArray(obj)) return obj.map(deserializeDate)
  if (!(obj instanceof Object)) return obj
  return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
    const value = obj[key]
    if (Array.isArray(value))
      acc[key] = value.map(deserializeDate)
    else
      acc[key] = isISODate.test(value)
        ? dayjs(value).toDate()
        : value instanceof Object
          ? deserializeDate(value)
          : value
    return acc
  }, {}) as T
}

import { DocumentSnapshot } from 'firebase-admin/lib/firestore'
import { match, P } from 'ts-pattern'
import { Middleware } from './index.type'

export const dateSerializer: Middleware = async (data, context, next) => {
  const innerData = match(data)
    .with({ before: P._, after: P._ }, ({ before, after }) => ({
      ...data,
      after: overrideData(after),
      before: overrideData(before)
    }))
    .with(P._, data => data)
    .exhaustive()
  return await next(
    innerData,
    context
  )
}

const overrideData = (doc: DocumentSnapshot): DocumentSnapshot => {
  const dataToParse = doc.data()
  doc.data = () => toDate(dataToParse)
  return doc
}

const toDate = <T>(obj: any): any => {
  if (!obj) return obj
  if (Array.isArray(obj)) return obj.map(toDate)
  if (!(obj instanceof Object)) return obj
  return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
    const value = obj[key]
    acc[key] = value?.toDate ? value.toDate() : value
    return acc
  }, {}) as T
}
import { DocumentSnapshot } from 'firebase-admin/firestore'
import { match, P } from 'ts-pattern'
import { Middleware } from './index.type'

export const triggerDateSerializer: Middleware = async (data, context, next) => {
  const innerData = match(data)
    .with({ before: P._, after: P._ }, ({ before, after }) => ({
      ...data,
      after: serializeSnapshotDate(after),
      before: serializeSnapshotDate(before)
    }))
    .with(P._, data => serializeSnapshotDate(data as DocumentSnapshot))
    .exhaustive()
  return await next(
    innerData,
    context
  )
}

const serializeSnapshotDate = (doc: DocumentSnapshot): DocumentSnapshot => {
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
    if (Array.isArray(value))
      acc[key] = value.map(toDate)
    else
      acc[key] = value?.toDate ? value.toDate() : value
    return acc
  }, {}) as T
}

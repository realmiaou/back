import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot
} from 'firebase-admin/firestore'

export * from './fireway/index'
export * from './backup'

export const genericDataConverter = <
    Type extends DocumentData
    >(): FirestoreDataConverter<Type> => ({
    toFirestore: (data: Type) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) =>
        toDate(snapshot.data())! as Type
  })

const toDate = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj
  Object.keys(obj).forEach(function (k) {
    if (obj[k] !== null && typeof obj[k] === 'object') {
      if (obj[k].toDate) {
        obj[k] = obj[k].toDate()
        return
      }
      toDate(obj[k])
    }
  })
  return obj
}

import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable
} from 'firebase/functions'
import {
  clearFirestoreData,
  initializeAdminApp,
  initializeTestApp
} from '@firebase/rules-unit-testing'
import { FirebaseApp } from '@firebase/app'
import { getFirestore } from 'firebase-admin/firestore'
import { Parameter, UserId } from '@miaou/types'

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIREBASE_EMULATOR_HOST ?? 'localhost:8080'
const projectId = process.env.FIREBASE_PROJECT_ID as string

const app = initializeAdminApp({ projectId })
export const testableHttp = <T extends (payload: any) => any>(
  name: string,
  userId?: UserId | string
) => {
  const app = initializeTestApp({
    projectId,
    ...(userId ? { auth: { uid: userId } } : {})
  })
  const functions = getFunctions(app as unknown as FirebaseApp, 'europe-west1')
  connectFunctionsEmulator(functions, 'localhost', 5001)
  return httpsCallable<Parameter<T>, ReturnType<T>>(functions, name)
}

export const clearDatabase = () => clearFirestoreData({ projectId })
export const firestoreTest = () => getFirestore(app)

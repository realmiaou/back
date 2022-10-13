import { Change, EventContext } from 'firebase-functions'
import { DocumentSnapshot } from 'firebase-admin/lib/firestore'
import { Parameter } from '@miaou/types'

export type Next = (
  data: Change<DocumentSnapshot> | DocumentSnapshot,
  context: EventContext
) => any | Promise<any>

export type Middleware = (
  data: Parameter<Next>,
  context: Parameters<Next>[1],
  next: Next
) => ReturnType<Next>

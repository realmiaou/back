import { https } from 'firebase-functions'
import { Parameter } from '@miaou/types'

export type Next<T> = (data: T, context: https.CallableContext) => any | Promise<any>

export type Middleware<DATA> = (
  data: Parameter<Next<DATA>>,
  context: Parameters<Next<DATA>>[1],
  next: Next<DATA>
) => ReturnType<Next<DATA>>

import { CallableContext } from 'firebase-functions/lib/common/providers/https'
import { Parameter } from '@miaou/types'

export type Next<T> = (data: T, context: CallableContext) => any | Promise<any>

export type Middleware<DATA> = (
  data: Parameter<Next<DATA>>,
  context: Parameters<Next<DATA>>[1],
  next: Next<DATA>
) => ReturnType<Next<DATA>>

import { CallableRequest } from 'firebase-functions/v2/https'
import { Parameter } from '@miaou/types'

export type Next<T> = (context: CallableRequest<T>) => any | Promise<any>

export type Middleware<DATA> = (
  context: Parameter<Next<DATA>>,
  next: Next<DATA>
) => ReturnType<Next<DATA>>

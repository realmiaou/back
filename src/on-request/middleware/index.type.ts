import { FunctionBuilder } from 'firebase-functions'
import { Parameter } from '@miaou/types'

export type Request = Parameters<Parameter<FunctionBuilder['https']['onRequest']>>[0]
export type Response = Parameters<Parameter<FunctionBuilder['https']['onRequest']>>[1]
export type Next = (request: Request, response: Response) => void | Promise<void>

export type Middleware = (
  request: Request,
  response: Response,
  next: Next
) => ReturnType<Next>

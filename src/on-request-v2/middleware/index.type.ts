import { onRequest } from 'firebase-functions/v2/https'
import { Parameter } from '@miaou/types'

export type Request = Parameters<Parameter<typeof onRequest>>[0]
export type Response = Parameters<Parameter<typeof onRequest>>[1]
export type Next = (request: Request, response: Response) => void | Promise<void>

export type Middleware = (
  request: Request,
  response: Response,
  next: Next
) => ReturnType<Next>

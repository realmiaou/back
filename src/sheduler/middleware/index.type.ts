import { EventContext } from 'firebase-functions'

export type Next = (context: EventContext) => PromiseLike<any> | any

export type Middleware = (
  context: EventContext,
  next: Next
) => ReturnType<Next>

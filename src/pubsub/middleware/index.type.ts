import { EventContext } from 'firebase-functions'
import { Parameter } from '@miaou/types'
import { Message } from 'firebase-functions/lib/providers/pubsub'

export type Next = (message: Message, context: EventContext) => PromiseLike<any> | any

export type Middleware = (
  data: Parameter<Next>,
  context: Parameters<Next>[1],
  next: Next
) => ReturnType<Next>

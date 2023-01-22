import { Parameter } from '@miaou/types'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { TaskContext } from 'firebase-functions/lib/common/providers/tasks'

export type Next = (message: Message, context: TaskContext) => PromiseLike<any> | any

export type Middleware = (
  data: Parameter<Next>,
  context: Parameters<Next>[1],
  next: Next
) => ReturnType<Next>

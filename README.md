# `@miaou/back` back utilities for Firebase

This library use : `firebase`

## Install

```bash
yarn add --exact @miaou/back
```

## Documentation
### Functions
#### Middleware

```typescript
const sentryInstance = Sentry.init({
    dsn: 'https://...',
    tracesSampleRate: 1.0,
});
const isProduction = process.env.ENVIRONMENT === 'production'
const isAdmin = (id: UserId) => Promise.resolve(true)

export const publicOnCall = <T extends (...args: any) => any>() =>
    typedOnCallWithMiddlewares<T>([
        sentry(sentryInstance),
        appCheck(isProduction),
        dateSerializer
    ])

export const authenticatedOnCall = <T extends (...args: any) => any>() =>
    typedOnCallWithMiddlewares<T>([
        sentry(sentryInstance),
        appCheck(isProduction),
        authenticated,
        dateSerializer
    ])

export const adminOnCall = <T extends (...args: any) => any>() =>
    typedOnCallWithMiddlewares<T>([
        sentry(sentryInstance),
        appCheck(isProduction),
        admin(isAdmin),
        dateSerializer
    ])
```

```typescript
export type LastNewsQuery = (locale: Locale) => Promise<New[]>

export const lastNews = authenticatedOnCall<LastNewsQuery>()((locale) =>
    findAllNews(locale, 3)
)
```

#### Testing

```typescript
import { firestoreTest, testableHttp } from '@miaou/back'
import 'chai/register-should.js'

// my-test.int.test.ts
describe('My test ', () => {
    it('Is order pending', async () => {
        // Given
        const db = firestoreTest()
        const isOrderPending = testableHttp<OrderCommand>('app-is-order-pending', 'tibo')
        await saveOrder(db)<Order>({ userId: 'tibo' as UserId })

        // When
        const { data } = await orderCommand('XXXX-XXXX' as OrderId)

        // Then
        data.should.be.false
    })
})
```

### Triggers
#### Middleware

```typescript
const sentryInstance = Sentry.init({
    dsn: 'https://...',
    tracesSampleRate: 1.0,
});

export const onWrite = typedOnWriteTriggerWithMiddlewares([
    sentry(sentryInstance),
    dateSerializer,
])

export const onUpdate = typedOnUpdateTriggerWithMiddlewares([
    sentry(sentryInstance),
    dateSerializer,
])

export const onDelete = typedOnDeleteTriggerWithMiddlewares([
    sentry(sentryInstance),
    dateSerializer,
])

export const onCreate = typedOnCreateTriggerWithMiddlewares([
    sentry(sentryInstance),
    dateSerializer,
])
```

```typescript
export const onOrderWrite = onWrite<Order>(
  'orders/{oderId}',
  async (orderChange) => {
    const beforeOrder = orderChange.before.data()
    const afterOrder = orderChange.after.data()

    // Delete
    if (!afterOrder && beforeOrder) {
      await deleteOrderView(database)(beforeOrder.id)
      return
    }

    // Create and Update
    if (afterOrder) {
      const order = await getOrder(afterOrder.id)
      const user = await getUser(afterOrder.userId)
      const licence = await getLicence(order.licenceId)
      const transaction = await getTransaction(order.transactionId)
      await saveOrderView(database)({
        ...order,
        user,
        licence,
        transaction,
      })
    }
  }
)


```

---

## Development

### How to use

```
yarn install
```

### Test

You can use `yarn link` to debug the module

### Release commit semantic

The release is automated by release-semantic plugin. When merge to master:

- Generate tag version
- Automate library versioning based on commit history
- Generate changelog based on commit history

```text
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|ect.
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

###### Usage

```text
fix: testing patch releases
```

```text
feat: testing minor releases
```

```text
feat: testing major releases

BREAKING CHANGE: This is a breaking change.
```

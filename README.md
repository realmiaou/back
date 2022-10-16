# `@miaou/back` back utilities for Firebase

This library use : `firebase`

## Install

```bash
yarn add --exact @miaou/back
```

## Documentation

### Firestore

#### Backup for firestore

#### Requirements

- [gcloud](https://cloud.google.com/sdk/docs/install)
- [gsutil](https://cloud.google.com/storage/docs/gsutil_install)

You must set the right for the default app engine service account.

```bash
gcloud auth login
```

```bash
gcloud config set project PROJECT_ID
```

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member serviceAccount:PROJECT_ID@appspot.gserviceaccount.com \
    --role roles/datastore.importExportAdmin
```

```bash
gsutil iam ch serviceAccount:PROJECT_ID@appspot.gserviceaccount.com:admin \
    gs://PROJECT_ID.appspot.com
```


#### Usage for backup

You could configure your backup as you want.
You can set folderName and expiration time with your preferences


```typescript
// index.ts
import { getStorage } from 'firebase-admin/storage'
import { backup } from '@miaou/back/lib/firestore'

const app = initializeApp()
const storage = getStorage(app)

export const myBackup = backup(
  pubsub.schedule('every 24 hours').timeZone('Europe/Paris'),
  storage.bucket()
)({ folderName: 'backup', expirationIn: 2 })
```

#### Usage for restore

This example is for restore backup when folder name is `backup`.
If you have another folder name you can replace it with yours

```bash
gcloud firestore import gs://PROJECT_ID.appspot.com/backup/YYYY-MM-DD
```

#### Fireway

You must name your file with the following pattern `v{version_number}-{file_name}.migration.ts`.
- `v001-orders-validated.migration.ts`
- `v002-deleted-commands.migration.ts`
- `v003-users.migration.ts`


```typescript
// v001-orders.migration.ts
import {BigBatch} from '@qualdesk/firestore-big-batch'

const database = getFirestore()

export const migrate = async () => {
    const batch = new BigBatch({firestore: database})
    const db = database.collection('order')

    Object.values(inventory).forEach((inventoryProduct) => {
        const ref = db.doc(inventoryProduct.id)
        batch.set(ref, {
            id: inventoryProduct.id,
            productId: inventoryProduct.productId,
            quantity: inventoryProduct.quantity,
        })
    })

    await batch.commit()
}
```

```typescript
import {region} from 'firebase-functions'
import {getFirestore} from 'firebase-admin/firestore'
// Do not forget to call your function export * as system from './infra/spi/migration' in your index.ts
export const migrate = migrateFirestore(
    region('europe-west1'),
    getFirestore(), { migrationFolderPath: __dirname })
```

#### Best practices

Do not import functions or types from other package/folder (expect firebase packages). Your migration code should be isolated.

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
import {firestoreTest, testableHttp} from '@miaou/back'
import 'chai/register-should.js'

// my-test.int.test.ts
describe('My test ', () => {
    it('Is order pending', async () => {
        // Given
        const db = firestoreTest()
        const isOrderPending = testableHttp<OrderCommand>('app-is-order-pending', 'tibo')
        await saveOrder(db)<Order>({userId: 'tibo' as UserId})

        // When
        const {data} = await orderCommand('XXXX-XXXX' as OrderId)

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

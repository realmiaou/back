import { v1 } from '@google-cloud/firestore'
import { Day } from '@miaou/types'

const client = new v1.FirestoreAdminClient()

export type BackupMigration = {
    folderName?: string
    expirationIn?: Day
    dryRun?: boolean
}

export type BackupScheduler = {
    onRun: (handler: () => Promise<any>) => void
}

export type BackupBucketFile = {
    metadata: { timeCreated: string },
    name: string,
    delete: () => Promise<any>
}

export type BackupBucket = {
    name: string
    getFiles: () => Promise<[BackupBucketFile[], any, any]>
}

export const backup = (pubsub: BackupScheduler, bucket: BackupBucket, { folderName = 'backup', expirationIn = 7, dryRun = false }: BackupMigration = {}) =>
  pubsub
    .onRun(async () => {
      if (dryRun) return
      const date = new Date()
      const bucketPath = `gs://${bucket.name}/${folderName}/${date.getFullYear()}-${date.getMonth() + 1}-${date.getUTCDate()}`
      const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
      await removeOldBackups(bucket)(folderName, expirationIn)
      const databaseName = client.databasePath(projectId!, '(default)')
      await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucketPath,
        collectionIds: []
      })
    })

const removeOldBackups = (bucket: BackupBucket) => async (folderName: string, expirationIn: Day) => {
  const [files] = await bucket.getFiles()
  const dateToRemove = new Date(Date.now() - expirationIn * 24 * 60 * 60 * 1000)
  const backups = files.filter(file => file.name.startsWith(`${folderName}/`))
  await Promise.all(backups
    .filter(file => file.metadata.timeCreated < dateToRemove.toISOString())
    .map(file => file.delete()))
}

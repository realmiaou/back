import path from 'path'
import { FunctionBuilder } from 'firebase-functions'
import { Firestore } from 'firebase-admin/firestore'
import fg from 'fast-glob'

export type MigrationConfiguration = {
  migrationFolderPath?: string
}
type MigrationScript = {
    migrate: () => Promise<void>
    version: number
}

export const migrateFirestore = (https: FunctionBuilder, database: Firestore, { migrationFolderPath = process.cwd() }: MigrationConfiguration) =>
  https.runWith({ timeoutSeconds: 540 })
    .https.onRequest(async (_, resp) => {
      const files = await fg([path.join(migrationFolderPath, '**/*.migration.js')], { dot: true })
      const instances: MigrationScript[] = await Promise.all(files.map(async file => ({
        version: parseInt(path.basename(file).match(/(?<=v)(.*?)(?=-)/)![0]),
        migrate: (await import(file)).migrate
      })))
      await migrate(database)(instances)
      resp.send('OK')
    })

const migrate = (database: Firestore) => async (migrationScripts: MigrationScript[]) => {
  const stats = {
    scannedFiles: 0,
    executedFiles: 0,
    created: 0,
    set: 0,
    updated: 0,
    deleted: 0,
    added: 0
  }
  stats.scannedFiles = migrationScripts.length
  console.log(`Found ${stats.scannedFiles} migration files`)

  const collection = database.collection('fireway')
  const lastMigration =
        (await collection.orderBy('version', 'desc').get()).docs[0]?.data() ?? null

  const currentVersion : number = lastMigration ? lastMigration.version : 0
  const filesToMigrate = migrationScripts.filter(
    ({ version }) => version > currentVersion
  )
  for (const file of filesToMigrate) {
    stats.executedFiles += 1
    console.log('Running', file.version)

    const start = new Date()
    try {
      await file.migrate()
    } catch (e: any) {
      console.log('error during script.migrate()', e)
      throw new Error(e)
    }
    const finish = new Date()

    console.log(`Uploading the results for ${file.version}`)

    await collection.doc(`${file.version}`).set({
      version: file.version,
      installedOn: start,
      executionTime: finish.getTime() - start.getTime()
    })
  }
  const { scannedFiles, executedFiles, added, created, updated, set, deleted } =
        stats
  console.log('Finished all firestore migrationScripts')
  console.log(
        `Files scanned:${scannedFiles} executed:${executedFiles}`
  )
  console.log(
        `Docs added:${added} created:${created} updated:${updated} set:${set} deleted:${deleted}`
  )
}

import path from 'path'
import fg from 'fast-glob'
import { MigrationScript } from './fireway'

describe('Fireway', () => {
  it('Should parse version from file name', () => {
    // Given
    const path1 = '/Users/thibaut/Code/waren-space/functions/src/infra/spi/migration/main/v003-contracts-data.ts'

    // When
    const version = parseInt(path.basename(path1).match(/(?<=v)(.*?)(?=-)/)![0])

    // Then
    expect(version).toEqual(3)
  })

  it('Should run migrate()', async () => {
    // When
    const files = await fg([path.join(process.cwd(), '**/*.migration.ts')], { dot: true })
    const instances: MigrationScript[] = await Promise.all(files.map(async file => ({
      version: parseInt(path.basename(file).match(/(?<=v)(.*?)(?=-)/)![0]),
      migrate: (await import(file)).migrate
    })))
    for (const file of instances) {
      await file.migrate()
    }
  })
})

import path from 'path'

describe('Fireway', () => {
  it('Should list all files', () => {
    const path1 = '/Users/thibaut/Code/waren-space/functions/src/infra/spi/migration/main/v003-contracts-data.ts'
    const version = parseInt(path.basename(path1).match(/(?<=v)(.*?)(?=-)/)![0])
    expect(version).toEqual(3)
  })
})

import { deserializeDate, serializeDate } from './date'

describe('Date', () => {
  it('Should serialize', () => {
    // Given
    const data = [{
      id: 1039,
      status: 'good',
      completion: 100,
      updatedAt: new Date('2021-01-01T00:00:00.000Z'),
      score: 100
    }]

    // When
    const serialized = serializeDate(data)

    // Then
    expect(serialized).toStrictEqual([{ completion: 100, id: 1039, score: 100, status: 'good', updatedAt: '2021-01-01T00:00:00.000Z' }])
  })

  it('Should deserialize', () => {
    // Given
    const data = [{ completion: 100, id: 1039, score: 100, status: 'good', updatedAt: '2021-01-01T00:00:00.000Z' }]

    // When
    const deserialize = deserializeDate(data)

    // Then
    expect(deserialize).toStrictEqual([{ completion: 100, id: 1039, score: 100, status: 'good', updatedAt: new Date('2021-01-01T00:00:00.000Z') }])
  })
})

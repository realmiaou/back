import TuyAPI from 'tuyapi'
// @ts-ignore
import Denon from 'denon-client'

describe.skip('s', () => {
  it('ssss work', async () => {
    const device = new TuyAPI({
      id: 'bff9ec0ab7910d1763trij',
      key: 'E{q~!S7D*+WF6DeP',
      issueGetOnConnect: true
    })

    // console.log(await device.get({}))
    device.on('connected', () => {
      console.log('Connected to device!')
    })

    device.on('disconnected', () => {
      console.log('Disconnected from device.')
    })

    device.on('error', (error) => {
      console.log('Error!', error)
    })

    device.on('dp-refresh', (data) => {
      console.log('DP_REFRESH data from device: ', data)
    })
    device.on('error', (data) => {
      console.log('error: ', data)
    })

    device.on('data', (data) => {
      console.log('DATA from device: ', data)
    })

    console.log(await device.find())
    console.log(await device.connect())
    // await device.refresh({})

    await device.set({ dps: 60, set: true as boolean })
    await device.get({})

    // refresh({schema: true})
    // console.log(await device.refresh({ schema: true }))
    // @ts-ignore
    // console.log(await device.refresh({ dps: [60] }))

    // await device.set({ set: !status })
    //
    // status = await device.get()
    //
    // console.log(`New status: ${status}.`)

    // promise setTimeout
    await new Promise(resolve => setTimeout(resolve, 600000))
    await device.disconnect()
  })

  it('ssss denon', async () => {
    const denonClient = new Denon.DenonClient('192.168.0.137')

    denonClient.on('powerChanged', (data: any) => {
      // This event will fire every time when the volume changes.
      // Including non requested volume changes (Using a remote, using the volume wheel on the device).
      console.log(`power changed to STANDBY/ON: ${data}`)
    })

    await denonClient.connect()
    console.log('connect')
    await denonClient.setPower('ON')
    await denonClient.setInput('SAT/CBL')
    await new Promise(resolve => setTimeout(resolve, 600000))
  })

  it('ssss fan ', () => {
    expect(toStep(0)).toBe(1)
    expect(toStep(100)).toBe(6)
    expect(toStep(10)).toBe(1)
    expect(toStep(25)).toBe(2)
    expect(toStep(87)).toBe(6)

    expect(toPercent(0, 1)).toBe(0)
    expect(toPercent(10, 1)).toBe(10)
    expect(toPercent(33, 1)).toBe(0)
    expect(toPercent(100, 1)).toBe(0)

    expect(toPercent(0, 3)).toBe(30)
    expect(toPercent(10, 3)).toBe(30)
    expect(toPercent(33, 3)).toBe(33)
    expect(toPercent(100, 3)).toBe(30)

    expect(toPercent(0, 6)).toBe(100)
    expect(toPercent(98, 6)).toBe(98)
    expect(toPercent(33, 6)).toBe(100)
    expect(toPercent(100, 6)).toBe(100)
  })

  const toStep = (percent: number) => {
    const etapes = [1, 2, 3, 4, 5, 6]
    const etapeIndex = Math.floor(percent / 16.67) // 100 / 6 = 16.67
    return etapes[etapeIndex]
  }

  const toPercent = (initialPercentage: number, step: number) => {
    const plagesPourcentage = [0, 15, 30, 50, 65, 80, 100]
    const plageMin = plagesPourcentage[step - 1]
    const plageMax = plagesPourcentage[step]
    if (initialPercentage >= plageMin && initialPercentage <= plageMax) return initialPercentage
    if (step === 1) return 0
    if (step === 6) return 100
    return plageMin
  }
})

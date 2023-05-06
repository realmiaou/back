import yaml from 'yaml'
import get from 'lodash/get'

describe('mail', () => {
  it('should work', () => {
    const templateI18n = yaml.parse(`
en:
  subject: Welcome {{email}}!
  title: Ready to optimize your meeting?
  description: >
    Are you ready to improve your meeting experiences?
    You are 90 seconds away from supercharging your meetings.
  part1:
    title: Save one day a week in meeting time
    subtitle: Save one day a week in meeting time
  part2:
    title: People-centric, consensus-based approach
    subtitle: 98% of meetings where attendees share preferences and feedback are more productive
  part3:
    title: Personalise your approach to meetings
    subtitle: Understand your meeting members and help them to understand you
  footer: Share your preferences to change your meeting experiences forever
  button: Get Started
    `)
    const lang = 'en'
    const path = 'part1.title'
    expect(get(templateI18n, `${lang}.${path}`)).toBe('Save one day a week in meeting time')
  })
})

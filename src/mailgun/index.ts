import path from 'path'
import fs from 'fs'
import fg from 'fast-glob'
import { FunctionBuilder } from 'firebase-functions'
import mjml2html from 'mjml'
import Mailgun from 'mailgun.js'
import formData from 'form-data'
import Client from 'mailgun.js/client'

export type MailGunConfiguration = {
    srcFolderPath?: string
    mailgunApiKey: string
    mailgunDomainUrl: string
    mailgunApiUrl: string
}
export type MailTemplate = { html: string, name: string, description: string }
export const publishMailgunTemplate = (https: FunctionBuilder, { srcFolderPath = process.cwd(), mailgunDomainUrl, mailgunApiUrl, mailgunApiKey }: MailGunConfiguration) =>
  https.runWith({ timeoutSeconds: 540 })
    .https.onRequest(async (_, resp) => {
      const files = await fg([path.join(srcFolderPath, '**/*.mjml')], { dot: true })
      const mailgunTemplates = files.map<MailTemplate>(file => ({
        name: path.basename(file).replace('.mjml', ''),
        description: 'Autmatic deployement',
        html: mjml2html(fs.readFileSync(file).toString()).html
      }))
      const mailgun = new Mailgun(formData)
      const client = mailgun.client({
        username: 'api',
        key: mailgunApiKey,
        url: mailgunApiUrl
      })
      await Promise.all(mailgunTemplates.map(publishTemplate(client, mailgunDomainUrl)))
      resp.send('OK')
    })

const publishTemplate = (client: Client, mailgunDomainUrl: string) => async ({ name, description, html }: MailTemplate) => {
  await client.domains.domainTemplates.destroy(mailgunDomainUrl, name)
  await client.domains.domainTemplates.create(mailgunDomainUrl, {
    name,
    description,
    template: html
  })
}

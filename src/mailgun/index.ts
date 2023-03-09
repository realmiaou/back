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
      console.log(`mailgun: src path: ${srcFolderPath}`)
      const files = await fg(path.join(srcFolderPath, '**/*.mjml'))
      console.log(`mailgun: Found ${files.length} files`)
      const mailgunTemplates = files.map<MailTemplate>(file => ({
        name: path.basename(file).replace('.mjml', ''),
        description: 'Automatic deployment',
        html: mjml2html(fs.readFileSync(file).toString()).html
      }))
      const mailgun = new Mailgun(formData)
      const client = mailgun.client({
        username: 'api',
        key: mailgunApiKey,
        url: mailgunApiUrl
      })
      await Promise.all(mailgunTemplates.map(template => publishTemplate(client, mailgunDomainUrl)(template)))
      resp.send('OK')
    })

const publishTemplate = (client: Client, mailgunDomainUrl: string) => async ({ name, description, html }: MailTemplate) => {
  console.log(`mailgun: publishing ${name} to mailgun API`)
  try {
    await client.domains.domainTemplates.destroy(mailgunDomainUrl, name)
  } catch (e) {
    console.log(`mailgun: cannot delete template ${name}`)
  }

  try {
    await client.domains.domainTemplates.create(mailgunDomainUrl, {
      name,
      description,
      template: html
    })
  } catch (e) {
    console.log(`mailgun: error publishing template ${name}`)
  }
}

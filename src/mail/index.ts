import path from 'path'
import fs from 'fs'
import fg from 'fast-glob'
import mjml2html from 'mjml'
import yaml from 'yaml'
import handlebars from 'handlebars'
import { GeneratedMail, MailToGenerate } from './index.type'

export const generateMail = async ({ templateFileName, locale = 'en', variables, srcPath }: MailToGenerate) => {
  const [i18nPath] = await fg(
    path.join(srcPath, `**/${templateFileName}.i18n.yml`)
  )
  const i18n = fs.readFileSync(i18nPath).toString()
  const templateI18n = yaml.parse(i18n)
  handlebars.registerHelper('$t', key =>
    handlebars.compile(templateI18n[locale][key] ?? '')(variables)
  )
  const subject = handlebars.compile(templateI18n[locale].subject ?? '')(
    variables
  )

  const [templatePath] = await fg(
    path.join(srcPath, `**/${templateFileName}.mjml`)
  )
  const template = fs.readFileSync(templatePath).toString()
  const compiled = handlebars.compile(template)(variables)
  const { html } = mjml2html(compiled)
  return { html, subject } as GeneratedMail
}

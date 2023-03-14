import path from 'path'
import fs from 'fs'
import fg from 'fast-glob'
import mjml2html from 'mjml'
import yaml from 'yaml'
import handlebars from 'handlebars'
import { GeneratedMail, MailToGenerate } from './index.type'

export const generateMail = async ({ templateFileName, locale = 'en', variables, srcPath }: MailToGenerate) => {
  // i18nToCompile
  const [i18nPath] = await fg(
    path.join(srcPath, `**/${templateFileName}.i18n.yml`)
  )
  const i18nToCompile = fs.readFileSync(i18nPath).toString()
  const templateI18n = yaml.parse(i18nToCompile)
  handlebars.registerHelper('$t', key =>
    handlebars.compile(templateI18n[locale][key] ?? '')(variables)
  )
  const subject = handlebars.compile(templateI18n[locale].subject ?? '')(
    variables
  )

  // mjml
  const [templatePath] = await fg(
    path.join(srcPath, `**/${templateFileName}.mjml`)
  )
  const templateToCompile = fs.readFileSync(templatePath).toString()
  const compiledTemplate = handlebars.compile(templateToCompile)(variables)
  const { html } = mjml2html(compiledTemplate)

  // text
  const [textPath] = await fg(
    path.join(srcPath, `**/${templateFileName}.txt`)
  )
  const textToCompile = fs.readFileSync(textPath).toString()
  const text = handlebars.compile(textToCompile)(variables)

  return { html, subject, text } as GeneratedMail
}

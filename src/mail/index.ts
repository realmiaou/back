import path from 'path'
import fs from 'fs'
import fg from 'fast-glob'
import mjml2html from 'mjml'
import yaml from 'yaml'
import handlebars from 'handlebars'
import { LanguageIso } from '@miaou/types'
import { GeneratedMail, MailToGenerate } from './index.type'

export const generateMail = async ({ templateFileName, locale = 'en', variables, srcPath }: MailToGenerate) => {
  const [i18nPath] = await fg(path.join(srcPath, `**/${templateFileName}.i18n.yml`))
  initI18n(i18nPath, locale, variables)

  const subject = toSubject(i18nPath, locale, variables)

  const [mjmlPath] = await fg(path.join(srcPath, `**/${templateFileName}.mjml`))
  const html = toMjml(mjmlPath, variables)

  const [textPath] = await fg(path.join(srcPath, `**/${templateFileName}.txt`))
  const text = toText(textPath, variables)

  return { html, subject: subject ?? '', text: text ?? '' } as GeneratedMail
}

const initI18n = (i18nPath: string | undefined, locale: LanguageIso, variables = {}) => {
  if (!i18nPath) return
  const i18nToCompile = fs.readFileSync(i18nPath).toString()
  const templateI18n = yaml.parse(i18nToCompile)
  handlebars.registerHelper('$t', key =>
    handlebars.compile(templateI18n[locale][key] ?? '')(variables)
  )
}

const toSubject = (i18nPath: string | undefined, locale: LanguageIso, variables = {}) => {
  if (!i18nPath) return null
  const i18nToCompile = fs.readFileSync(i18nPath).toString()
  const templateI18n = yaml.parse(i18nToCompile)
  return handlebars.compile(templateI18n[locale].subject ?? '')(variables)
}

const toMjml = (mjmlPath: string | undefined, variables = {}) => {
  if (!mjmlPath) return null
  const mjmlTemplate = fs.readFileSync(mjmlPath).toString()
  const mjmlCompiled = handlebars.compile(mjmlTemplate)(variables)
  const { html } = mjml2html(mjmlCompiled)
  return html
}

const toText = (textPath: string | undefined, variables = {}) => {
  if (!textPath) return null
  const textToCompile = fs.readFileSync(textPath).toString()
  return handlebars.compile(textToCompile)(variables)
}

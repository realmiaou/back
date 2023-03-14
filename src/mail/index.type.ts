import { LanguageIso } from '@miaou/types'

export type MailToGenerate = {
    srcPath: string,
    locale: LanguageIso
    templateFileName: string,
    variables?: { [key: string]: string }

}

export type GeneratedMail = {
    html: string,
    text: string,
    subject: string,
}

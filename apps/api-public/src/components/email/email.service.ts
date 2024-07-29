import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly subjectPrefix: string

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService
  ) {
    this.subjectPrefix = this.configService.get('mail.subject_prefix')
  }

  async send(options: ISendMailOptions) {
    return await this.mailerService.sendMail(options)
  }
}

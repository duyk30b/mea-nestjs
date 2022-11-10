import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { EmailConfig } from '../../environments'
import { EmailService } from './email.service'

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule.forFeature(EmailConfig)],
			inject: [EmailConfig.KEY],
			useFactory: (mailConfig: ConfigType<typeof EmailConfig>) => {
				return {
					transport: {
						host: mailConfig.host,
						port: mailConfig.port,
						auth: {
							user: mailConfig.user,
							pass: mailConfig.password,
						},
					},
					defaults: { from: `"${mailConfig.name}" <${mailConfig.from}>` },
				}
			},

		}),
	],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule { }

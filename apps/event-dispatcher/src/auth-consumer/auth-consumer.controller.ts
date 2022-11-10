import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { KafkaTopic, KAFKA_EVENT, MessageId } from '../kafka'
import { AuthConsumerService } from './auth-consumer.service'
import { UserChangeEmailDto } from './dto/user-change-email.dto'

@Controller()
export class AuthConsumerController {
	constructor(private readonly authConsumerService: AuthConsumerService) { }

	@KafkaTopic(KAFKA_EVENT.AUTH_USER_CHANGE_EMAIL)
	async handleUserChangeEmail(@Payload() payload: UserChangeEmailDto, @MessageId() messageId: string) {
		await this.authConsumerService.handleAuthMessage({
			messageId,
			kafkaEvent: KAFKA_EVENT.AUTH_USER_CHANGE_EMAIL,
			data: payload.data,
			createdTime: payload.createdTime,
		})
	}
}

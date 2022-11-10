import { Expose } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class KafkaMessageDto {
	@Expose({ name: 'created_time' })
	@IsNumber()
	createdTime: number

	@Expose()
	@IsNumber()
	version: number
}

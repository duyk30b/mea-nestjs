import { Expose, Type } from 'class-transformer'
import { IsDefined, IsNumber, ValidateNested } from 'class-validator'
import { KafkaMessageDto } from '../../kafka'

export class ArrivalCreateData extends KafkaMessageDto {
	@Expose({ name: 'oid' })
	@IsDefined()
	@Type(() => Number)
	oid: number

	@Expose({ name: 'arrival_id' })
	@IsDefined()
	@Type(() => Number)
	arrivalId: number
}

export class ArrivalCreateDto extends KafkaMessageDto {
	@Expose()
	@ValidateNested({ each: true })
	@Type(() => ArrivalCreateData)
	data: ArrivalCreateData
}

// Example:
// {
// 	"data": {
// 	  "oid": 1,
// 	  "arrival_id": 1
// 	},
// 	"created_time": 1673826654345,
// 	"version": 1
// }

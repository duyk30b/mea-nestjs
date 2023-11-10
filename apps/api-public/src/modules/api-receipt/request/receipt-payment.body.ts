import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'

export class ReceiptPaymentBody {
	@ApiProperty({ name: 'money', example: 1_200_000 })
	@Expose({ name: 'money' })
	@IsDefined()
	@IsNumber()
	money: number
}

import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'

export class InvoicePaymentMoneyBody {
	@ApiProperty({ name: 'debt', example: 1_200_000 })
	@Expose({ name: 'debt' })
	@IsDefined()
	@IsNumber()
	debt: number
}

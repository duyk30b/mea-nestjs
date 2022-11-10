import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'

export class CustomerDebtPaymentBody {
	@ApiProperty({ name: 'customer_id', example: 12 })
	@Expose({ name: 'customer_id' })
	@IsDefined()
	@IsNumber()
	customerId: number

	@ApiProperty({ name: 'money', example: 1_250_000 })
	@Expose({ name: 'money' })
	@IsDefined()
	@IsNumber()
	money: number

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng còn bo thêm tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string
}

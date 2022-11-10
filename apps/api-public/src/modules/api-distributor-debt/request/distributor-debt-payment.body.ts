import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'

export class DistributorDebtPaymentBody {
	@ApiProperty({ name: 'distributor_id', example: 12 })
	@Expose({ name: 'distributor_id' })
	@IsDefined()
	@IsNumber()
	distributorId: number

	@ApiProperty({ name: 'money', example: 1_250_000 })
	@Expose({ name: 'money' })
	@IsDefined()
	@IsNumber()
	money: number

	@ApiPropertyOptional({ name: 'note', example: 'NCC còn nợ thêm tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator'

export class ReceiptPayments {
	@Expose({ name: 'receipt_id' })
	@IsDefined()
	@IsNumber()
	receiptId: number

	@Expose({ name: 'money' })
	@IsDefined()
	@IsNumber()
	money: number
}

export class DistributorPaymentPayDebtBody {
	@ApiProperty({ name: 'distributor_id', example: 12 })
	@Expose({ name: 'distributor_id' })
	@IsDefined()
	@IsNumber()
	distributorId: number

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng còn bo thêm tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string

	@ApiPropertyOptional({
		type: ReceiptPayments,
		isArray: true,
		example: [{ receiptId: 12, money: 10000 }, { receiptId: 13, money: 200000 }],
	})
	@Expose({ name: 'receipt_payments' })
	@IsDefined()
	@Type(() => ReceiptPayments)
	@IsArray()
	@ValidateNested({ each: true })
	receiptPayments: ReceiptPayments[]                 // Phụ phí
}

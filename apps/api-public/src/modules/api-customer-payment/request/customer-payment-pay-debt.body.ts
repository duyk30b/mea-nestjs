import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator'

export class InvoicePayments {
	@Expose({ name: 'invoice_id' })
	@IsDefined()
	@IsNumber()
	invoiceId: number

	@Expose({ name: 'money' })
	@IsDefined()
	@IsNumber()
	money: number
}
export class CustomerPaymentPayDebtBody {
	@ApiProperty({ name: 'customer_id', example: 12 })
	@Expose({ name: 'customer_id' })
	@IsDefined()
	@IsNumber()
	customerId: number

	@ApiPropertyOptional({ name: 'note', example: 'Khách hàng còn bo thêm tiền' })
	@Expose({ name: 'note' })
	@IsString()
	note: string

	@ApiPropertyOptional({
		type: InvoicePayments,
		isArray: true,
		example: [{ invoiceId: 12, money: 10000 }, { invoiceId: 13, money: 200000 }],
	})
	@Expose({ name: 'invoice_payments' })
	@IsDefined()
	@Type(() => InvoicePayments)
	@IsArray()
	@ValidateNested({ each: true })
	invoicePayments: InvoicePayments[]                 // Phụ phí
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator'

export class InvoicePayments {
  @Expose()
  @IsDefined()
  @IsNumber()
  invoiceId: number

  @Expose()
  @IsDefined()
  @IsNumber()
  money: number
}
export class CustomerPaymentPayDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerId: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiPropertyOptional({
    type: InvoicePayments,
    isArray: true,
    example: [
      { invoiceId: 12, money: 10000 },
      { invoiceId: 13, money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => InvoicePayments)
  @IsArray()
  @ValidateNested({ each: true })
  invoicePayments: InvoicePayments[] // Phụ phí
}

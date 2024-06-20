import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class InvoicePayments {
  @Expose()
  @IsDefined()
  @IsInt()
  invoiceId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  money: number
}

export class VisitPayments {
  @Expose()
  @IsDefined()
  @IsInt()
  visitId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  money: number
}
export class CustomerPaymentPayDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({
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
  invoicePaymentList: InvoicePayments[] // Phụ phí

  @ApiProperty({
    type: InvoicePayments,
    isArray: true,
    example: [
      { visitId: 12, money: 10000 },
      { visitId: 13, money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => VisitPayments)
  @IsArray()
  @ValidateNested({ each: true })
  visitPaymentList: VisitPayments[] // Phụ phí
}

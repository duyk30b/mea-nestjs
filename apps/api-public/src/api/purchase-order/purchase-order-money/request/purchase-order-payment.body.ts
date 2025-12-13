import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsString } from 'class-validator'

export class PurchaseOrderPaymentBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @Expose()
  @IsDefined()
  @IsInt()
  paidAmount: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsNumber, IsString } from 'class-validator'

export class PaymentUpdateInfoBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  createdAt: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}

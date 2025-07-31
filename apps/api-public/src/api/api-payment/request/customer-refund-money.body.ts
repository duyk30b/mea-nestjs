import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  IsDefined,
  IsInt,
  IsString,
} from 'class-validator'
import {
  IsNumberGreaterThan,
} from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class CustomerRefundMoneyBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  refundAmount: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}

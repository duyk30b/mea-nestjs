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

export class DistributorPrepaymentBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  receiptId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  distributorId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  paidAmount: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}

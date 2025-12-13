import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class OtherPaymentBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  paidAmount: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}

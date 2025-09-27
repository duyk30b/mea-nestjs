import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'

class DataList {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  purchaseOrderId: string

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  paidAmount: number
}

export class DistributorPayDebtBody {
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

  @ApiProperty({ type: DataList, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => DataList)
  @IsArray()
  @ValidateNested({ each: true })
  dataList: DataList[]
}

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsString, Validate } from 'class-validator'
import { IsPhone } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class DistributorCreateBody {
  @ApiProperty({ example: 'Ngô Nhật Dương' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  fullName: string

  @ApiProperty({ default: '0986123456' })
  @Expose()
  @Validate(IsPhone)
  phone: string

  @ApiPropertyOptional({ example: 'Tỉnh Lâm Đồng' })
  @Expose()
  @IsString()
  addressProvince: string

  @ApiPropertyOptional({ example: 'Xã Tiên Hoàng' })
  @Expose()
  @IsString()
  addressWard: string

  @ApiPropertyOptional({ example: 'Thôn Trần Lệ Mai' })
  @Expose()
  @IsString()
  addressStreet: string

  @ApiPropertyOptional({ example: 'Khách hàng không' })
  @Expose()
  @IsString()
  note: string

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class DistributorUpdateBody extends PartialType(DistributorCreateBody) { }

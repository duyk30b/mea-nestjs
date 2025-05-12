import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator'
import { IsPhone } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { EGender } from '../../../../../_libs/database/common/variable'

export class CustomerCreateBody {
  @ApiProperty({ example: 'Phạm Hoàng Mai' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  fullName: string

  @ApiPropertyOptional({ example: '0986123456' })
  @Expose()
  @Validate(IsPhone)
  phone: string

  @ApiPropertyOptional({ example: '0986123456' })
  @Expose()
  @IsDefined()
  @IsString()
  facebook: string

  @ApiPropertyOptional({ example: '0986123456' })
  @Expose()
  @IsDefined()
  @IsString()
  zalo: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerSourceId: number

  @ApiPropertyOptional({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  birthday: number

  @ApiPropertyOptional({ example: 1998 })
  @Expose()
  @IsNumber()
  yearOfBirth: number

  @ApiPropertyOptional({ enum: [0, 1], example: EGender.Female })
  @Expose()
  @IsIn([0, 1])
  gender: EGender

  @ApiPropertyOptional({ example: 'Tỉnh Hưng Yên' })
  @Expose()
  @IsString()
  addressProvince: string

  @ApiPropertyOptional({ example: 'Huyện Khoái Châu' })
  @Expose()
  @IsString()
  addressDistrict: string

  @ApiPropertyOptional({ example: 'Xã Dạ Trạch' })
  @Expose()
  @IsString()
  addressWard: string

  @ApiPropertyOptional({ example: 'Thôn Đức Nhuận' })
  @Expose()
  @IsString()
  addressStreet: string

  @ApiPropertyOptional({ example: 'Mẹ Nguyễn Thị Hương, sđt: 0988021146' })
  @Expose() // người thân
  @IsString()
  relative: string

  @ApiPropertyOptional({ example: 'Mổ ruột thừa năm 2018' })
  @Expose()
  @IsString()
  healthHistory: string

  @ApiPropertyOptional({ example: 'Khách hàng không' })
  @Expose()
  @IsString()
  note: string

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class CustomerUpdateBody extends PartialType(CustomerCreateBody) { }

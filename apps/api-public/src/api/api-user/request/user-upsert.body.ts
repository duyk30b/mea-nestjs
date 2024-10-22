import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  Validate,
} from 'class-validator'
import { IsPhone } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { EGender } from '../../../../../_libs/database/common/variable'

export class UserCreateBody {
  @ApiProperty({ example: '0376123456' })
  @Expose()
  @Validate(IsPhone)
  phone: string

  @ApiProperty({ example: 'admin' })
  @Expose()
  @IsDefined()
  @IsString()
  @MinLength(4)
  username: string

  @ApiProperty({ example: 'Abc@123456' })
  @Expose()
  @IsDefined()
  @MinLength(6)
  password: string

  @ApiProperty({ example: 'Phạm Hoàng Mai' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  fullName: string

  @ApiPropertyOptional({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  birthday: number

  @ApiPropertyOptional({ enum: [0, 1], example: EGender.Female })
  @Expose()
  @IsIn([0, 1])
  gender: EGender

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsDefined()
  @IsArray()
  roleIdList: number[]
}

export class UserUpdateBody extends OmitType(UserCreateBody, ['username', 'password']) { }

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator'
import { IsPhone } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { EGender } from '../../../../../_libs/database/common/variable'

export class AccountBody {
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
}

export class UserBody {
  @ApiProperty({ example: '0376123456' })
  @Expose()
  @Validate(IsPhone)
  phone: string

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
}

export class UserCreateBody {
  @ApiProperty({ type: UserBody })
  @Expose()
  @Type(() => UserBody)
  @IsDefined()
  @ValidateNested({ each: true })
  user: UserBody

  @ApiProperty({ type: AccountBody })
  @Expose()
  @Type(() => AccountBody)
  @IsDefined()
  @ValidateNested({ each: true })
  account: AccountBody

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsDefined()
  @IsArray()
  roleIdList: number[]

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsDefined()
  @IsArray()
  roomIdList: number[]
}

export class UserUpdateBody {
  @ApiProperty({ type: UserBody })
  @Expose()
  @Type(() => UserBody)
  @IsDefined()
  @ValidateNested({ each: true })
  user: UserBody

  @ApiProperty({ type: AccountBody })
  @Expose()
  @Type(() => AccountBody)
  @IsOptional()
  @ValidateNested({ each: true })
  account?: AccountBody

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsOptional()
  @IsArray()
  roleIdList?: number[]

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsOptional()
  @IsArray()
  roomIdList?: number[]
}

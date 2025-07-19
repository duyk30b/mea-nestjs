import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString, MinLength, Validate } from 'class-validator'
import { IsPhone } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class LoginBody {
  @ApiProperty({ example: '0376899866' })
  @Expose()
  @IsDefined()
  @IsString()
  organizationCode: string

  @ApiProperty({ example: 'admin' })
  @Expose()
  @IsDefined()
  @MinLength(4)
  username: string

  @ApiProperty({ example: 'Abc@123456' })
  @Expose()
  @IsDefined()
  @MinLength(6)
  password: string
}

export class LoginRootBody extends LoginBody {
  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  oid: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNumber()
  uid: number
}

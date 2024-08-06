import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsOptional, IsString, MinLength, Validate } from 'class-validator'
import { IsGmail, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class VerifyOrganizationEmailQuery {
  @ApiProperty({ example: 4 })
  @Expose()
  @Type(() => Number)
  @IsDefined()
  @IsNumberGreaterThan(0)
  oid: number

  @ApiProperty({ example: 'mea@gmail.com' })
  @Expose()
  @IsDefined()
  @Validate(IsGmail)
  email: string

  @ApiProperty({ example: '$2b$05$G17lx6yO8fK2iJK6tqX2XODsCrawFzSht5vJQjE7wlDJO0.4zxPxO' })
  @Expose()
  @IsDefined()
  @IsString()
  @MinLength(6)
  token: string

  @ApiProperty({ example: '1' })
  @Expose()
  @IsOptional()
  ver: string
}

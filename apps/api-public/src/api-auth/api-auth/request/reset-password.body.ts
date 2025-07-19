import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString, MinLength } from 'class-validator'

export class ResetPasswordBody {
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

  @ApiProperty({ example: '$2b$05$G17lx6yO8fK2iJK6tqX2XODsCrawFzSht5vJQjE7wlDJO0.4zxPxO' })
  @Expose()
  @IsDefined()
  @MinLength(6)
  token: string

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  updatedAt: number
}

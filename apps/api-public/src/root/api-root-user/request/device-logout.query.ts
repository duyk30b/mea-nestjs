import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNumber, IsString } from 'class-validator'

export class DeviceLogoutBody {
  @ApiProperty({ example: 'LSGXOWSX' })
  @Expose()
  @IsString()
  code: string

  @ApiProperty({ example: 2 })
  @Expose()
  @IsNumber()
  oid: number
}

import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

export class DeviceLogoutBody {
  @ApiProperty({ example: 'LSGXOWSX' })
  @Expose()
  @IsString()
  code: string
}

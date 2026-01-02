import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

export class DeviceLogoutBody {
  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsString()
  clientId: string
}

import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { SettingKey } from '../../../../../_libs/database/entities/setting.entity'

export class SettingUpsertParams {
  @ApiProperty({ example: SettingKey.GOOGLE_DRIVER })
  @Expose()
  @IsString()
  @IsNotEmpty()
  type: SettingKey
}

export class SettingUpsertBody {
  @ApiProperty({ example: JSON.stringify({}) })
  @Expose()
  @IsString()
  data: string
}

import { SettingKey } from '@libs/database/entities/setting.entity'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

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

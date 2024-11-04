import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { SettingKey } from '../../../../../_libs/database/entities/setting.entity'

export class SettingUpsertParams {
  @ApiProperty({ enum: SettingKey, example: SettingKey.PRODUCT_UNIT })
  @Expose()
  @IsEnumValue(SettingKey)
  type: SettingKey
}

export class SettingUpsertBody {
  @ApiProperty({
    example: JSON.stringify('Viên, Lọ, Cái, Chai'),
  })
  @Expose()
  @IsString()
  data: string
}

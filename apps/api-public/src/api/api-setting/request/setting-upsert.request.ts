import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { SettingKey } from '../../../../../_libs/database/entities/setting.entity'

export class SettingUpsertParams {
  @ApiProperty({ enum: SettingKey, example: SettingKey.PRODUCT_GROUP })
  @Expose()
  @IsEnumValue(SettingKey)
  type: SettingKey
}

export class SettingUpsertBody {
  @ApiProperty({
    example: JSON.stringify({
      1: 'Kháng sinh - Kháng Virus',
      2: 'Dị ứng',
      3: 'Thần Kinh',
      4: 'Tiêu Hóa',
      5: 'Cơ Xương Khớp',
      6: 'Giảm Đau - Hạ Sốt - NSAID',
      7: 'Corticoid',
      8: 'Thực Phẩm Chức Năng',
      9: 'Dinh Dưỡng',
      10: 'Hô hấp',
      11: 'Tim Mạch',
      12: 'Da Liễu',
    }),
  })
  @Expose()
  @IsString()
  data: string
}

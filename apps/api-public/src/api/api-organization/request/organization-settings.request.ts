import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsIn, IsString } from 'class-validator'
import { keysEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { ScreenSettingKey } from '../../../../../_libs/database/entities/organization-setting.entity'

export class OrganizationSettingGetQuery {
  // @ApiProperty({
  //     name: 'types[]',
  //     example: [
  //         ScreenSettingKey.PRODUCT_GROUP,
  //         ScreenSettingKey.PRODUCT_ROUTE,
  //         ScreenSettingKey.PRODUCT_UNIT,
  //     ],
  //     type: Number,
  //     isArray: true,
  // })
  // @Type(() => Number)
  // @Expose({ name: 'types[]' })
  // @IsArray()
  // types: number[]

  @ApiProperty({
    type: 'string',
    example: JSON.stringify(keysEnum(ScreenSettingKey)),
    description: JSON.stringify(keysEnum(ScreenSettingKey)),
  })
  @Transform(({ value }) => {
    try {
      return JSON.parse(value)
    } catch (error) {
      return ''
    }
  })
  @Expose()
  @IsArray()
  @IsIn(keysEnum(ScreenSettingKey), { each: true })
  types: ScreenSettingKey[]
}

export class OrganizationSettingUpdateParams {
  @ApiProperty({ enum: ScreenSettingKey, example: ScreenSettingKey.PRODUCT_GROUP })
  @Expose()
  @IsEnumValue(ScreenSettingKey)
  type: ScreenSettingKey
}

export class OrganizationSettingUpdateBody {
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

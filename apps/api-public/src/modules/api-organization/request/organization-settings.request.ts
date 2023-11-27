import { ApiProperty } from '@nestjs/swagger'
import { keysEnum } from '_libs/common/helpers/typescript.helper'
import { OrganizationSettingType } from '_libs/database/entities/organization-setting.entity'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsEnum, IsIn, IsString } from 'class-validator'

export class OrganizationSettingGetQuery {
    // @ApiProperty({
    //     name: 'types[]',
    //     example: [
    //         OrganizationSettingType.PRODUCT_GROUP,
    //         OrganizationSettingType.PRODUCT_ROUTE,
    //         OrganizationSettingType.PRODUCT_UNIT,
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
        example: JSON.stringify(keysEnum(OrganizationSettingType)),
        description: JSON.stringify(keysEnum(OrganizationSettingType)),
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
    @IsIn(keysEnum(OrganizationSettingType), { each: true })
    types: OrganizationSettingType[]
}

export class OrganizationSettingUpdateParams {
    @ApiProperty({ enum: OrganizationSettingType, example: OrganizationSettingType.PRODUCT_GROUP })
    @Expose()
    @IsEnum(OrganizationSettingType)
    type: OrganizationSettingType
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

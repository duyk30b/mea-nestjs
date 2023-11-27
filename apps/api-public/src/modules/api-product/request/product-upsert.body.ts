import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator'

export class UnitConversionQuery {
    @Expose()
    @IsDefined()
    @IsString()
    name: string

    @Expose()
    @IsDefined()
    @IsNumber()
    rate: number
}

export class ProductCreateBody {
    @ApiProperty({ example: 'Klacid 125mg/5ml' })
    @Expose()
    @IsDefined()
    @IsString()
    brandName: string // tên biệt dược

    @ApiPropertyOptional({ example: 'Clarythromycin 125mg/5ml' })
    @Expose()
    @IsString()
    substance: string // Hoạt chất

    @ApiPropertyOptional({ example: '2' })
    @Expose()
    @IsString()
    group: string // nhóm thuốc: kháng sinh, dinh dưỡng ...

    // @ApiPropertyOptional({ name: 'unit', type: 'string', example: '[{"name":"Viên","rate":1}]' })
    // @Expose({ name: 'unit' })
    // @Transform(({ value }) => {
    //     try {
    //         const err = []
    //         const result = JSON.parse(value).map((i: any) => {
    //             const instance = Object.assign(new UnitConversionQuery(), i)
    //             const validate = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true })
    //             if (validate.length) err.push(...validate)
    //             return instance
    //         })
    //         if (err.length) return err
    //         else return JSON.stringify(result)
    //     }
    //     catch (error) { return [error.message] }
    // })
    // @IsString({ message: 'Validate unit failed: Example: [{"name":"Viên","rate":1}]' })
    // unit: string                                   // đơn vị tính: lọ, ống, vỉ

    @ApiPropertyOptional({
        type: UnitConversionQuery,
        isArray: true,
        example: [
            { name: 'Viên', rate: 1 },
            { name: 'Hộp', rate: 10 },
        ],
    })
    @Expose()
    @IsDefined()
    @Type(() => UnitConversionQuery)
    @IsArray()
    @ValidateNested({ each: true })
    unit: UnitConversionQuery[]

    @ApiPropertyOptional({ example: 'Uống' })
    @Expose()
    @IsString()
    route: string // Đường dùng

    @ApiPropertyOptional({ example: 'Ấn Độ' })
    @Expose()
    @IsString()
    source: string // Nguồn gốc

    @ApiPropertyOptional({
        example: 'https://cdn.medigoapp.com/product/Klacid_125mg_5ml_4724e139c8.jpg',
    })
    @Expose()
    @IsString()
    image: string

    @ApiPropertyOptional({ example: 'Uống 1 viên/ngày, 9h sáng, sau ăn no' })
    @Expose()
    @IsString()
    hintUsage: string // Nguồn gốc

    @ApiPropertyOptional({ example: true })
    @Expose()
    @IsBoolean()
    isActive: boolean
}

export class ProductUpdateBody extends PartialType(ProductCreateBody) {}

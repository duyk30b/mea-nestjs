import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsDefined, IsIn, IsInt, IsNumber, IsString, validateSync } from 'class-validator'

export class UnitConversionBody {
  @Expose()
  @IsDefined()
  @IsString()
  name: string

  @Expose()
  @IsDefined()
  @IsNumber()
  rate: number

  @Expose()
  @IsBoolean()
  default: boolean
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

  @ApiPropertyOptional({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  lotNumber: string

  @ApiPropertyOptional({ example: 1679995369195 })
  @Expose()
  // @IsDefined() //expiryDate được phép null
  @IsInt()
  expiryDate: number

  @ApiPropertyOptional({ example: 20_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  costPrice: number

  @ApiPropertyOptional({ example: 45_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsNumber()
  wholesalePrice: number

  @ApiPropertyOptional({ example: 59_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsNumber()
  retailPrice: number

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  productGroupId: number

  @ApiPropertyOptional({ name: 'unit', type: 'string', example: JSON.stringify([{ name: 'Viên', rate: 1 }]) })
  @Expose({ name: 'unit' })
  @Transform(({ value }) => {
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        const instance = Object.assign(new UnitConversionBody(), i)
        const validate = validateSync(instance, {
          whitelist: true,
          forbidNonWhitelisted: true,
          skipMissingProperties: true,
        })
        if (validate.length) err.push(...validate)
        return instance
      })
      if (err.length) return err
      else return JSON.stringify(result)
    } catch (error) {
      return [error.message]
    }
  })
  @IsString({ message: `Validate unit failed: Example: ${JSON.stringify([{ name: 'Viên', rate: 1 }])}` })
  unit: string // đơn vị tính: lọ, ống, vỉ

  // @ApiPropertyOptional({
  //     type: UnitConversionBody,
  //     isArray: true,
  //     example: [
  //         { name: 'Viên', rate: 1 },
  //         { name: 'Hộp', rate: 10 },
  //     ],
  // })
  // @Expose()
  // @IsDefined()
  // @Type(() => UnitConversionBody)
  // @IsArray()
  // @ValidateNested({ each: true })
  // unit: UnitConversionBody[]

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

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsIn([0, 1])
  hasManageQuantity: 0 | 1

  @ApiPropertyOptional({ example: 0 })
  @Expose()
  @IsIn([0, 1])
  hasManageBatches: 0 | 1

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class ProductUpdateBody extends PartialType(ProductCreateBody) { }

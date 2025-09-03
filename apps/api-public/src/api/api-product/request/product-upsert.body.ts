import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  ProductType,
  SplitBatchByCostPrice,
  SplitBatchByDistributor,
  SplitBatchByExpiryDate,
  SplitBatchByWarehouse,
} from '../../../../../_libs/database/entities/product.entity'
import { DiscountUpdateBody } from '../../api-discount/request'
import { PositionBasicBody } from '../../api-position/request'

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

export class ProductCreate {
  @ApiPropertyOptional({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  productCode: string

  @ApiProperty({ example: 'Klacid 125mg/5ml' })
  @Expose()
  @IsDefined()
  @IsString()
  brandName: string // tên biệt dược

  @ApiPropertyOptional({ example: 'Clarythromycin 125mg/5ml' })
  @Expose()
  @IsString()
  substance: string // Hoạt chất

  @ApiPropertyOptional({ example: 59_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiPropertyOptional({ example: 45_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
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
  @IsDefined()
  @IsNumber()
  retailPrice: number

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  productGroupId: number

  @ApiPropertyOptional({
    name: 'unit',
    type: 'string',
    example: JSON.stringify([{ name: 'Viên', rate: 1 }]),
  })
  @Expose()
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
  @IsString({
    message: `Validate unit failed: Example: ${JSON.stringify([{ name: 'Viên', rate: 1 }])}`,
  })
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
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1

  @ApiProperty({ enum: ProductType, example: ProductType.Basic })
  @Expose()
  @IsDefined()
  @IsEnumValue(ProductType)
  productType: ProductType

  @ApiProperty({ enum: SplitBatchByWarehouse, example: SplitBatchByWarehouse.Inherit })
  @Expose()
  @IsDefined()
  @IsEnumValue(SplitBatchByWarehouse)
  splitBatchByWarehouse: SplitBatchByWarehouse

  @ApiProperty({
    enum: SplitBatchByDistributor,
    example: SplitBatchByDistributor.Inherit,
  })
  @Expose()
  @IsDefined()
  @IsEnumValue(SplitBatchByDistributor)
  splitBatchByDistributor: SplitBatchByDistributor

  @ApiProperty({ enum: SplitBatchByExpiryDate, example: SplitBatchByExpiryDate.Inherit })
  @Expose()
  @IsDefined()
  @IsEnumValue(SplitBatchByExpiryDate)
  splitBatchByExpiryDate: SplitBatchByExpiryDate

  @ApiProperty({ enum: SplitBatchByCostPrice, example: SplitBatchByCostPrice.Inherit })
  @Expose()
  @IsDefined()
  @IsEnumValue(SplitBatchByCostPrice)
  splitBatchByCostPrice: SplitBatchByCostPrice

  @ApiPropertyOptional({ type: 'string', example: JSON.stringify([1, 5, 10]) })
  @Expose()
  @Transform(({ value }) => {
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        if (!Number.isInteger) err.push(`${i} is not integer`)
        return i
      })
      if (err.length) return err
      else return JSON.stringify(result)
    } catch (error) {
      return [error.message]
    }
  })
  @IsDefined()
  @IsString({ message: `Validate warehouseIds failed: Example: ${JSON.stringify([1, 2, 3])}` })
  warehouseIds: string // đơn vị tính: lọ, ống, vỉ
}

export class ProductUpdate extends OmitType(ProductCreate, ['quantity']) { }

export class ProductCreateBody {
  @ApiProperty({ type: ProductCreate })
  @Expose()
  @Type(() => ProductCreate)
  @IsDefined()
  @ValidateNested({ each: true })
  product: ProductCreate

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionRequestList: PositionBasicBody[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]
}

export class ProductUpdateBody {
  @ApiProperty({ type: ProductUpdate })
  @Expose()
  @Type(() => ProductUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  product: ProductUpdate

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionRequestList: PositionBasicBody[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]
}

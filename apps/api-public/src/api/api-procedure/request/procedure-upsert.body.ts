import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { ProcedureType } from '../../../../../_libs/database/entities/procedure.entity'
import { DiscountUpdateBody } from '../../api-discount/request'
import { PositionBasicBody } from '../../api-position/request'

export class ConsumableConversion {
  @Expose()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  productId: number

  @Expose()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  quantity: number
}

export class ProcedureCreate {
  @ApiProperty({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  procedureCode?: string

  @ApiProperty({ example: 'Truyền dịch 500ml' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // tên dịch vụ

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  procedureGroupId: number // Giá dịch vụ

  @ApiProperty({ example: ProcedureType.Basic })
  @Expose()
  @IsEnumValue(ProcedureType)
  procedureType: ProcedureType

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantityDefault: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  gapHours: number

  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number // Giá dịch vụ

  @ApiProperty({
    type: 'string',
    example: JSON.stringify(<ConsumableConversion[]>[{ productId: 20, quantity: 1 }]),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        const instance = Object.assign(new ConsumableConversion(), i)
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
    message:
      `Validate consumablesHint failed: Example: `
      + `${JSON.stringify(<ConsumableConversion[]>[{ productId: 30, quantity: 4 }])}`,
  })
  consumablesHint: string // đơn vị tính: lọ, ống, vỉ

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class ProcedureUpsertBody {
  @ApiProperty({ type: ProcedureCreate })
  @Expose()
  @Type(() => ProcedureCreate)
  @IsDefined()
  @ValidateNested({ each: true })
  procedure: ProcedureCreate

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionList: PositionBasicBody[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]
}

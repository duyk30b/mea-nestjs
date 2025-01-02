import { ApiProperty, PartialType } from '@nestjs/swagger'
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
import { CommissionCalculatorType } from '../../../../../_libs/database/entities/commission.entity'
import { ProcedureType } from '../../../../../_libs/database/entities/procedure.entity'

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

export class ProcedureCommission {
  @Expose()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  roleId: number

  @Expose()
  @IsDefined()
  @IsNumber()
  commissionValue: number

  @ApiProperty({ example: CommissionCalculatorType.VND })
  @Expose()
  @IsEnumValue(CommissionCalculatorType)
  commissionCalculatorType: CommissionCalculatorType
}

export class ProcedureCreateBody {
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

  @ApiProperty({ type: ProcedureCommission, isArray: true })
  @Expose()
  @Type(() => ProcedureCommission)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  commissionList: ProcedureCommission[]
}

export class ProcedureUpdateBody extends PartialType(ProcedureCreateBody) { }

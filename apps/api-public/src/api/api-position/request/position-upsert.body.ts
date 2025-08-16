import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsPositive,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  CommissionCalculatorType,
  PositionInteractType,
} from '../../../../../_libs/database/entities/position.entity'
import { PositionFilterQuery } from './position-options.request'

export class PositionCreateBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roleId: number

  @ApiProperty({ enum: PositionInteractType, example: PositionInteractType.Ticket })
  @Expose()
  @IsDefined()
  @IsEnumValue(PositionInteractType)
  positionType: PositionInteractType

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  positionInteractId: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  commissionValue: number

  @ApiProperty({
    enum: valuesEnum(CommissionCalculatorType),
    example: CommissionCalculatorType.VND,
  })
  @Expose()
  @IsDefined()
  @IsEnumValue(CommissionCalculatorType)
  commissionCalculatorType: CommissionCalculatorType
}

export class PositionUpdateBody extends PartialType(PositionCreateBody) { }

export class PositionReplaceListBody {
  @ApiProperty({ type: PositionCreateBody, isArray: true })
  @Expose()
  @Type(() => PositionCreateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  positionData: PositionCreateBody[]

  @ApiProperty({ type: PositionFilterQuery })
  @Expose()
  @Type(() => PositionFilterQuery)
  @IsDefined()
  @ValidateNested({ each: true })
  filter: PositionFilterQuery
}

@ValidatorConstraint({ name: 'validateCommissionValue', async: false })
class ValidateCommissionValue implements ValidatorConstraintInterface {
  validate(val: number, args: ValidationArguments) {
    const object = args.object as PositionBasicBody
    if (
      object.commissionCalculatorType === CommissionCalculatorType.PercentActual
      || object.commissionCalculatorType === CommissionCalculatorType.PercentExpected
    ) {
      if (val < 0 || val > 100) return false
    }
    return true
  }

  defaultMessage(args: ValidationArguments) {
    return 'Giá trị tiền hoa hồng = $value là không hợp lệ'
  }
}

export class PositionBasicBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  roleId: number

  @Expose()
  @IsDefined()
  @IsNumber()
  @Validate(ValidateCommissionValue)
  commissionValue: number

  @ApiProperty({ example: CommissionCalculatorType.VND })
  @Expose()
  @IsEnumValue(CommissionCalculatorType)
  commissionCalculatorType: CommissionCalculatorType
}

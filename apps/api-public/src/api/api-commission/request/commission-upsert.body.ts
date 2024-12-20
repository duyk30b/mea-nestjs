import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  CommissionCalculatorType,
  RoleInteractType,
} from '../../../../../_libs/database/entities/commission.entity'

export class CommissionCreateBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roleId: number

  @ApiProperty({ enum: RoleInteractType, example: RoleInteractType.Ticket })
  @Expose()
  @IsDefined()
  @IsEnumValue(RoleInteractType)
  interactType: RoleInteractType

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  interactId: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  value: number

  @ApiProperty({
    enum: valuesEnum(CommissionCalculatorType),
    example: CommissionCalculatorType.VND,
  })
  @Expose()
  @IsDefined()
  @IsEnumValue(CommissionCalculatorType)
  calculatorType: CommissionCalculatorType
}

export class CommissionUpdateBody extends PartialType(CommissionCreateBody) { }

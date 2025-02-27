import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  CommissionCalculatorType,
  InteractType,
} from '../../../../../_libs/database/entities/commission.entity'
import { CommissionFilterQuery } from './commission-options.request'

export class CommissionCreateBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roleId: number

  @ApiProperty({ enum: InteractType, example: InteractType.Ticket })
  @Expose()
  @IsDefined()
  @IsEnumValue(InteractType)
  interactType: InteractType

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  interactId: number

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

export class CommissionUpdateBody extends PartialType(CommissionCreateBody) { }

export class CommissionReplaceListBody {
  @ApiProperty({ type: CommissionCreateBody, isArray: true })
  @Expose()
  @Type(() => CommissionCreateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  commissionData: CommissionCreateBody[]

  @ApiProperty({ type: CommissionFilterQuery })
  @Expose()
  @Type(() => CommissionFilterQuery)
  @IsDefined()
  @ValidateNested({ each: true })
  filter: CommissionFilterQuery
}
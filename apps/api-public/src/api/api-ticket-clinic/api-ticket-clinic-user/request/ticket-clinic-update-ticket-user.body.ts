import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import {
  IsEnumValue,
} from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { CommissionCalculatorType } from '../../../../../../_libs/database/entities/position.entity'

export class TicketClinicUpdateTicketUserBody {
  @ApiProperty({ enum: valuesEnum(CommissionCalculatorType), example: CommissionCalculatorType.VND })
  @Expose()
  @IsDefined()
  @IsEnumValue(CommissionCalculatorType)
  commissionCalculatorType: CommissionCalculatorType

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  commissionMoney: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  commissionPercentActual: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  commissionPercentExpected: number
}

import { valuesEnum } from '@libs/common/helpers/typescript.helper'
import {
    IsEnumValue,
} from '@libs/common/transform-validate/class-validator.custom'
import { CommissionCalculatorType } from '@libs/database/entities/position.entity'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'

export class TicketUpdateTicketUserCommissionBody {
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

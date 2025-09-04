import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  DiscountType,
  PaymentMoneyStatus,
  TicketProcedureStatus,
} from '../../../../../../_libs/database/common/variable'
import { ProcedureType } from '../../../../../../_libs/database/entities/procedure.entity'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

class TicketProcedureItemBody {
  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsOptional()
  @IsNumber()
  registeredAt: number

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsNumber()
  indexSession: number
}

class TicketProcedureBasicBody {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  procedureId: number

  @ApiProperty({ example: ProcedureType.Basic })
  @Expose()
  @IsEnumValue(ProcedureType)
  procedureType: ProcedureType

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  totalSessions: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  expectedPrice: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  @Max(100)
  @Min(0)
  discountPercent: number

  @ApiProperty({ enum: valuesEnum(DiscountType), example: DiscountType.VND })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  actualPrice: number

  @ApiProperty({ example: TicketProcedureStatus.Pending })
  @Expose()
  @IsDefined()
  @IsEnumValue(TicketProcedureStatus)
  status: TicketProcedureStatus

  @ApiProperty({ example: PaymentMoneyStatus.NoEffect })
  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentMoneyStatus)
  @IsIn([PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending])
  paymentMoneyStatus: PaymentMoneyStatus

  @ApiProperty({ example: Date.now() })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsOptional()
  @IsInt()
  createdAt: number
}

export class TicketProcedureWrapBody {
  @ApiProperty({ type: TicketProcedureItemBody })
  @Expose()
  @Type(() => TicketProcedureItemBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureItemList: TicketProcedureItemBody[]

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserRequestList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketProcedureBasicBody })
  @Expose()
  @Type(() => TicketProcedureBasicBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketProcedure: TicketProcedureBasicBody
}

export class TicketAddTicketProcedureListBody {
  @ApiProperty({ type: TicketProcedureWrapBody })
  @Expose()
  @Type(() => TicketProcedureWrapBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketProcedureWrapList: TicketProcedureWrapBody[]
}

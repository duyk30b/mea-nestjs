import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsIn, IsNumber, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType, PaymentMoneyStatus } from '../../../../../../_libs/database/common/variable'
import { TicketProcedureStatus } from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

class TicketRegimenBasicBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  regimenId: number

  @ApiProperty({ example: PaymentMoneyStatus.TicketPaid })
  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentMoneyStatus)
  @IsIn([
    PaymentMoneyStatus.TicketPaid,
    PaymentMoneyStatus.NoEffect,
    PaymentMoneyStatus.PendingPayment,
  ])
  paymentMoneyStatus: PaymentMoneyStatus

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

  @ApiProperty({ enum: valuesEnum(TicketProcedureStatus), example: TicketProcedureStatus.NoEffect })
  @Expose()
  @IsDefined()
  @IsEnumValue(TicketProcedureStatus)
  status: TicketProcedureStatus

  @ApiProperty({ example: PaymentMoneyStatus.TicketPaid })
  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentMoneyStatus)
  @IsIn([
    PaymentMoneyStatus.TicketPaid,
    PaymentMoneyStatus.NoEffect,
    PaymentMoneyStatus.PendingPayment,
  ])
  paymentMoneyStatus: PaymentMoneyStatus

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

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
  @IsDefined()
  @IsNumber()
  actualPrice: number
}

export class TicketProcedureRegimenAddWrapBody {
  @ApiProperty({ type: TicketProcedureBasicBody })
  @Expose()
  @Type(() => TicketProcedureBasicBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketProcedureAdd: TicketProcedureBasicBody

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  totalSession: number
}

export class TicketProcedureNormalWrapBody {
  @ApiProperty({ type: TicketProcedureBasicBody })
  @Expose()
  @Type(() => TicketProcedureBasicBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketProcedureAdd: TicketProcedureBasicBody

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserRequestAddList: TicketUserBasicBody[]
}

export class TicketRegimenWrapBody {
  @ApiProperty({ type: TicketRegimenBasicBody })
  @Expose()
  @Type(() => TicketRegimenBasicBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketRegimenAdd: TicketRegimenBasicBody

  @ApiProperty({ type: TicketProcedureRegimenAddWrapBody })
  @Expose()
  @Type(() => TicketProcedureRegimenAddWrapBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureRegimenAddWrapList: TicketProcedureRegimenAddWrapBody[]

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserRequestAddList: TicketUserBasicBody[]
}

export class TicketAddTicketProcedureListBody {
  @ApiProperty({ type: TicketRegimenWrapBody })
  @Expose()
  @Type(() => TicketRegimenWrapBody)
  @ValidateNested({ each: true })
  ticketRegimenAddWrapList?: TicketRegimenWrapBody[]

  @ApiProperty({ type: TicketProcedureNormalWrapBody })
  @Expose()
  @Type(() => TicketProcedureNormalWrapBody)
  @ValidateNested({ each: true })
  ticketProcedureNormalWrapList?: TicketProcedureNormalWrapBody[]
}

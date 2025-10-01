import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { TicketProcedureStatus } from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

class TicketRegimenBasicBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  regimenId: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  expectedMoney: number

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
  actualMoney: number
}

export class TicketRegimenItemAddBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  procedureId: number

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsInt()
  gapDay: number // Giá dịch vụ

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantityExpected: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  expectedMoneyAmount: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  discountMoneyAmount: number

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
  actualMoneyAmount: number
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

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsEnumValue(TicketProcedureStatus)
  status: TicketProcedureStatus

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

export class TicketProcedureWrapBody {
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

  @ApiProperty({ type: TicketRegimenItemAddBody })
  @Expose()
  @Type(() => TicketRegimenItemAddBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketRegimenItemAddList: TicketRegimenItemAddBody[]

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
  ticketRegimenWrapList?: TicketRegimenWrapBody[]

  @ApiProperty({ type: TicketProcedureWrapBody })
  @Expose()
  @Type(() => TicketProcedureWrapBody)
  @ValidateNested({ each: true })
  ticketProcedureWrapList?: TicketProcedureWrapBody[]
}

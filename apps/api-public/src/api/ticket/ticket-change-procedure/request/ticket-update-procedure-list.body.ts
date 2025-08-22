import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

class TicketProcedureBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  procedureId: number

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
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  actualPrice: number
}

export class TicketUpdateTicketProcedureListBody {
  @ApiProperty({ type: TicketProcedureBody, isArray: true })
  @Expose()
  @Type(() => TicketProcedureBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureList: TicketProcedureBody[]
}

export class TicketAddTicketProcedure {
  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketProcedureBody })
  @Expose()
  @Type(() => TicketProcedureBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketProcedure: TicketProcedureBody
}

export class TicketDestroyTicketProcedureParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  ticketId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  ticketProcedureId: number
}

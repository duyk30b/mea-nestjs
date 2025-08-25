import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import {
  IsEnumValue,
  IsNumberGreaterThan,
} from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

class TicketProcedureItemBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  id: number

  @ApiProperty({ example: Date.now() })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsOptional()
  @IsInt()
  completedAt: number
}

class TicketProcedureBody {
  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
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
}

export class TicketUpdateTicketProcedureBody {
  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketProcedureItemBody })
  @Expose()
  @Type(() => TicketProcedureItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureItemList?: TicketProcedureItemBody[]

  @ApiProperty({ type: TicketProcedureBody })
  @Expose()
  @Type(() => TicketProcedureBody)
  @ValidateNested({ each: true })
  ticketProcedure?: TicketProcedureBody
}

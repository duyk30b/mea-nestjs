import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'

export class TicketLaboratoryAddBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  laboratoryId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  laboratoryGroupId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsInt()
  costPrice: number

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

export class TicketLaboratoryGroupAddBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  laboratoryGroupId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roomId: number

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsInt()
  registeredAt: number

  @ApiProperty({ type: TicketLaboratoryAddBody, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryAddBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryList: TicketLaboratoryAddBody[]
}

export class TicketLaboratoryGroupUpdateBody extends TicketLaboratoryGroupAddBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  id: number
}

export class TicketClinicUpsertLaboratoryBody {
  @ApiProperty({ type: TicketLaboratoryGroupAddBody, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryGroupAddBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryGroupAddList: TicketLaboratoryGroupAddBody[]

  @ApiProperty({ type: TicketLaboratoryGroupUpdateBody, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryGroupUpdateBody)
  @ValidateNested({ each: true })
  ticketLaboratoryGroupUpdate: TicketLaboratoryGroupUpdateBody
}

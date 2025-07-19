import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { TicketUserBasicBody } from '../../api-ticket-clinic-user/request/ticket-clinic-update-user-list.body'

class TicketProductBody {
  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantityPrescription: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  printPrescription: number

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

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  costAmount: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  actualPrice: number

  @ApiPropertyOptional({ example: 'Uống 2 lần/ngày sáng 1 viên, chiều 1 viên' })
  @Expose()
  @IsString()
  hintUsage: string
}

export class TicketClinicUpdateTicketProductBody {
  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketProductBody })
  @Expose()
  @Type(() => TicketProductBody)
  @ValidateNested({ each: true })
  ticketProduct: TicketProductBody
}

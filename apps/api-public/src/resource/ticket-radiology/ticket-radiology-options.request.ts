import {
  ConditionString,
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
  transformConditionString,
} from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { TicketItemPaymentType } from '@libs/database/common/variable'
import { TicketRadiologyStatus } from '@libs/database/entities/ticket-radiology.entity'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, ValidateNested } from 'class-validator'

export class TicketRadiologyRelationQuery {
  @Expose()
  @IsOptional()
  radiology?: { radiologyGroup?: boolean; templateHtml?: boolean } | false

  @Expose()
  @IsBoolean()
  customer?: boolean

  @Expose()
  @IsBoolean()
  ticketUserRequestList?: boolean

  @Expose()
  @IsBoolean()
  ticketUserResultList?: boolean

  @Expose()
  @IsBoolean()
  ticket?: boolean

  @Expose()
  @IsBoolean()
  imageList?: boolean
}

const ConditionEnumTicketRadiologyStatus = createConditionEnum(TicketRadiologyStatus)
const ConditionEnumTicketItemPaymentType = createConditionEnum(TicketItemPaymentType)

export class TicketRadiologyFilterQuery {
  @Expose()
  @IsInt()
  oid?: number

  @Expose()
  @Transform(transformConditionString)
  @IsOptional()
  id?: string | ConditionString

  @Expose()
  @Transform(transformConditionString)
  @IsOptional()
  ticketId?: string | ConditionString

  @Expose()
  @IsInt()
  customerId?: number

  @Expose()
  @IsInt()
  radiologyId?: number

  @Expose()
  @IsInt()
  roomId?: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketRadiologyStatus))
  @IsOptional()
  status?: TicketRadiologyStatus | InstanceType<typeof ConditionEnumTicketRadiologyStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketItemPaymentType))
  @IsOptional()
  ticketItemPaymentType?: TicketItemPaymentType | InstanceType<typeof ConditionEnumTicketItemPaymentType>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  completedAt?: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt?: ConditionTimestamp
}

export class TicketRadiologySortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority?: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  completedAt?: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt?: 'ASC' | 'DESC'
}

export class TicketRadiologyResponseQuery {
  @Expose()
  @IsObject()
  ticketRadiology: TicketRadiologyRelationQuery
}

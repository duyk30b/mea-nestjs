import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'

export class TicketRadiologyRelationQuery {
  @Expose()
  @IsOptional()
  radiology: { radiologyGroup?: boolean; printHtml?: boolean } | false

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticketUserList: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  imageList: boolean
}

const ConditionEnumTicketRadiologyStatus = createConditionEnum(TicketRadiologyStatus)

export class TicketRadiologyFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketRadiologyStatus))
  @IsOptional()
  status: TicketRadiologyStatus | InstanceType<typeof ConditionEnumTicketRadiologyStatus>

  @Expose()
  @IsInt()
  radiologyId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  roomId: number

  @Expose()
  @IsInt()
  ticketId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp
}

export class TicketRadiologySortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  startedAt: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'
}

export class TicketRadiologyResponseQuery {
  @Expose()
  @IsObject()
  ticketRadiology: {
    ticket?: boolean
    customer?: boolean
    ticketUserList?: boolean
    imageList?: boolean
  }
}

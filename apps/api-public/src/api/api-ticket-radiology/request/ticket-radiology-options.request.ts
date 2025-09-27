import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionString,
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
  transformConditionString,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { PaymentMoneyStatus } from '../../../../../_libs/database/common/variable'
import { TicketRadiologyStatus } from '../../../../../_libs/database/entities/ticket-radiology.entity'

export class TicketRadiologyRelationQuery {
  @Expose()
  @IsOptional()
  radiology?: { radiologyGroup?: boolean; printHtml?: boolean } | false

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
const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)

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
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus?: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

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

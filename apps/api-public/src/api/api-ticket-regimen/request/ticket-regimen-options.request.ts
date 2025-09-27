import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsInt, IsObject, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionNumber,
  ConditionString,
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
  transformConditionString,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import {
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../_libs/database/common/variable'

export class TicketRegimenRelationQuery {
  @Expose()
  @IsBoolean()
  ticket?: boolean

  @Expose()
  @IsBoolean()
  customer?: boolean

  @Expose()
  @IsBoolean()
  regimen?: boolean

  @Expose()
  @IsObject()
  ticketProcedureList?: {
    imageList?: boolean
    ticketUserResultList?: boolean
  }

  @Expose()
  @IsBoolean()
  ticketUserRequestList?: boolean
}

const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)
const ConditionEnumTicketRegimenStatus = createConditionEnum(TicketRegimenStatus)

export class TicketRegimenFilterQuery {
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
  @Transform(transformConditionNumber)
  @IsOptional()
  customerId?: number | ConditionNumber

  @Expose()
  @IsInt()
  regimenId?: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus?: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketRegimenStatus))
  @IsOptional()
  status?: TicketRegimenStatus | InstanceType<typeof ConditionEnumTicketRegimenStatus>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt?: ConditionTimestamp
}

export class TicketRegimenSortQuery extends SortQuery { }

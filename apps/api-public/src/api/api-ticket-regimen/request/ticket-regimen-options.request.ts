import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { PaymentMoneyStatus, TicketRegimenStatus } from '../../../../../_libs/database/common/variable'

export class TicketRegimenRelationQuery {
  @Expose()
  @IsOptional()
  regimen?: boolean

  @Expose()
  @IsOptional()
  ticketRegimenItem?: { regimenItem?: { procedure?: boolean } }

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

const ConditionEnumTicketRegimenStatus = createConditionEnum(TicketRegimenStatus)
const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)

export class TicketRegimenFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketRegimenStatus))
  @IsOptional()
  status: TicketRegimenStatus | InstanceType<typeof ConditionEnumTicketRegimenStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

  @Expose()
  @IsInt()
  regimenId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp
}

export class TicketRegimenSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'
}

export class TicketRegimenResponseQuery {
  @Expose()
  @IsObject()
  ticketRegimen: {
    ticket?: boolean
    customer?: boolean
    ticketUserList?: boolean
    imageList?: boolean
  }
}

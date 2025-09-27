import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { PaymentMoneyStatus, TicketLaboratoryStatus } from '../../../../../_libs/database/common/variable'

export class TicketLaboratoryGroupRelationQuery {
  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticketUserList: boolean

  @Expose()
  @IsBoolean()
  ticketLaboratoryList: boolean

  @Expose()
  @IsBoolean()
  ticketLaboratoryResultMap: boolean

  @Expose()
  @IsBoolean()
  imageList: boolean
}

const ConditionEnumTicketLaboratoryStatus = createConditionEnum(TicketLaboratoryStatus)
const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)

export class TicketLaboratoryGroupFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketLaboratoryStatus))
  @IsOptional()
  status: TicketLaboratoryStatus | InstanceType<typeof ConditionEnumTicketLaboratoryStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  roomId: number

  @Expose()
  @IsInt()
  ticketId: string

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  completedAt: ConditionTimestamp
}

export class TicketLaboratoryGroupSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  completedAt: 'ASC' | 'DESC'
}

export class TicketLaboratoryGroupResponseQuery {
  @Expose()
  @IsObject()
  ticketLaboratoryGroup: {
    ticket?: boolean
    customer?: boolean
    ticketUserList?: boolean
    ticketLaboratoryList?: boolean
    ticketLaboratoryResultMap?: boolean
    imageList?: boolean
  }
}

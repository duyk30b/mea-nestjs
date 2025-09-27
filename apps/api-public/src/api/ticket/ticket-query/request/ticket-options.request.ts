import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionNumber,
  ConditionTimestamp,
  SortQuery,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
} from '../../../../../../_libs/common/dto'
import { DeliveryStatus } from '../../../../../../_libs/database/common/variable'
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'

export class TicketRelationQuery {
  @Expose()
  @IsBoolean()
  customer?: boolean

  @Expose()
  @IsBoolean()
  paymentList?: boolean

  @Expose()
  @IsBoolean()
  ticketReceptionList?: boolean

  @Expose()
  @IsBoolean()
  ticketAttributeList?: boolean

  @Expose()
  @IsBoolean()
  ticketSurchargeList?: boolean

  @Expose()
  @IsBoolean()
  ticketExpenseList?: boolean

  @Expose()
  @IsBoolean()
  ticketProductList?: boolean

  @Expose()
  @IsObject()
  ticketBatchList?: { batch?: boolean }

  @Expose()
  @IsBoolean()
  ticketProcedureList?: boolean

  @Expose()
  @IsBoolean()
  ticketRegimenList?: boolean

  @Expose()
  @IsBoolean()
  ticketRegimenItemList?: boolean

  @Expose()
  @IsBoolean()
  ticketLaboratoryGroupList?: boolean

  @Expose()
  @IsBoolean()
  ticketLaboratoryList?: boolean

  @Expose()
  @IsBoolean()
  ticketLaboratoryResultList?: boolean

  @Expose()
  @IsBoolean()
  ticketRadiologyList?: boolean

  @Expose()
  @IsBoolean()
  ticketUserList?: boolean

  @Expose()
  @IsBoolean()
  imageList?: boolean

  @Expose()
  @IsBoolean()
  customerSource?: boolean

  @Expose()
  @IsBoolean()
  toAppointment?: boolean
}

const ConditionEnumTicketStatus = createConditionEnum(TicketStatus)
const ConditionEnumDeliveryStatus = createConditionEnum(DeliveryStatus)

export class TicketFilterQuery {
  @Expose()
  @Type(() => TicketFilterQuery)
  @ValidateNested({ each: true })
  $OR: TicketFilterQuery[]

  // @Expose()
  // @IsEnumValue(TicketStatus)
  // status: TicketStatus

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  roomId: number | ConditionNumber

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketStatus))
  @IsOptional()
  status: TicketStatus | InstanceType<typeof ConditionEnumTicketStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, DeliveryStatus))
  @IsOptional()
  deliveryStatus: DeliveryStatus | InstanceType<typeof ConditionEnumDeliveryStatus>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  receptionAt: ConditionTimestamp
}

export class TicketSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  receptionAt: 'ASC' | 'DESC'
}

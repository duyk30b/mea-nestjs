import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'
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
import { TicketLaboratoryGroupGetManyQuery } from '../../../api-ticket-laboratory-group/request'
import { TicketLaboratoryGetManyQuery } from '../../../api-ticket-laboratory/request'
import { TicketProcedureGetManyQuery } from '../../../api-ticket-procedure/request'
import { TicketProductGetManyQuery } from '../../../api-ticket-product/request'
import { TicketRadiologyGetManyQuery } from '../../../api-ticket-radiology/request'

export class TicketRelationQuery {
  @Expose()
  @IsBoolean()
  customer?: boolean

  @Expose()
  @IsBoolean()
  paymentList?: boolean

  @Expose()
  @IsBoolean()
  ticketSurchargeList?: boolean

  @Expose()
  @IsBoolean()
  ticketExpenseList?: boolean

  @Expose()
  @IsBoolean()
  ticketAttributeList?: boolean

  @Expose()
  @IsOptional()
  ticketProductList?: TicketProductGetManyQuery

  @Expose()
  @IsOptional()
  ticketProductConsumableList?: TicketProductGetManyQuery

  @Expose()
  @IsOptional()
  ticketProductPrescriptionList?: TicketProductGetManyQuery

  @Expose()
  @IsOptional()
  ticketBatchList?: false | { batch?: boolean }

  @Expose()
  @IsOptional()
  ticketProcedureList?: TicketProcedureGetManyQuery

  @Expose()
  @IsOptional()
  ticketLaboratoryGroupList?: TicketLaboratoryGroupGetManyQuery

  @Expose()
  @IsOptional()
  ticketLaboratoryResultList?: boolean

  @Expose()
  @IsOptional()
  ticketLaboratoryList?: TicketLaboratoryGetManyQuery

  @Expose()
  @IsOptional()
  ticketRadiologyList?: TicketRadiologyGetManyQuery

  @Expose()
  @IsOptional()
  ticketUserList?: false | { user?: boolean }

  @Expose()
  @IsBoolean()
  toAppointment?: boolean

  @Expose()
  @IsBoolean()
  customerSource?: boolean

  @Expose()
  @IsBoolean()
  imageList?: boolean
}

const ConditionEnumTicketStatus = createConditionEnum(TicketStatus)
const ConditionEnumDeliveryStatus = createConditionEnum(DeliveryStatus)

export class TicketFilterQuery {
  // @Expose()
  // @IsEnumValue(TicketStatus)
  // status: TicketStatus

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketStatus))
  @IsOptional()
  status: TicketStatus | InstanceType<typeof ConditionEnumTicketStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, DeliveryStatus))
  @IsOptional()
  deliveryStatus: DeliveryStatus | InstanceType<typeof ConditionEnumDeliveryStatus>

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  roomId: number | ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class TicketSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'
}

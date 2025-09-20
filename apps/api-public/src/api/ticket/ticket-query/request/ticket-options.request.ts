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
import { TicketLaboratoryGroupGetManyQuery } from '../../../api-ticket-laboratory-group/request'
import { TicketLaboratoryGetManyQuery } from '../../../api-ticket-laboratory/request'
import { TicketProcedureGetManyQuery } from '../../../api-ticket-procedure/request'
import { TicketProductGetManyQuery } from '../../../api-ticket-product/request'
import { TicketRadiologyGetManyQuery } from '../../../api-ticket-radiology/request'
import { TicketRegimenGetManyQuery } from '../../../api-ticket-regimen/request'

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
  @IsObject()
  ticketProductList?: TicketProductGetManyQuery

  @Expose()
  @IsObject()
  ticketProductConsumableList?: TicketProductGetManyQuery

  @Expose()
  @IsObject()
  ticketProductPrescriptionList?: TicketProductGetManyQuery

  @Expose()
  @IsObject()
  ticketBatchList?: { batch?: boolean }

  @Expose()
  @IsObject()
  ticketProcedureList?: TicketProcedureGetManyQuery

  @Expose()
  @IsObject()
  ticketRegimenList?: TicketRegimenGetManyQuery

  @Expose()
  @IsObject()
  ticketRegimenListExtra?: TicketRegimenGetManyQuery

  @Expose()
  @IsObject()
  ticketLaboratoryGroupList?: TicketLaboratoryGroupGetManyQuery

  @Expose()
  @IsBoolean()
  ticketLaboratoryResultList?: boolean

  @Expose()
  @IsObject()
  ticketLaboratoryList?: TicketLaboratoryGetManyQuery

  @Expose()
  @IsObject()
  ticketRadiologyList?: TicketRadiologyGetManyQuery

  @Expose()
  @IsBoolean()
  toAppointment?: boolean

  @Expose()
  @IsBoolean()
  customerSource?: boolean

  @Expose()
  @IsObject()
  ticketUserList?: { user?: boolean }

  @Expose()
  @IsBoolean()
  imageList?: boolean
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

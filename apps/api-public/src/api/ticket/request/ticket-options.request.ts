import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionNumber,
  ConditionTimestamp,
  SortQuery,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { TicketStatus, TicketType } from '../../../../../_libs/database/entities/ticket.entity'

export class TicketRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  paymentList: boolean

  @Expose()
  @IsBoolean()
  ticketSurchargeList: boolean

  @Expose()
  @IsBoolean()
  ticketExpenseList: boolean

  @Expose()
  @IsBoolean()
  ticketAttributeList: boolean

  @Expose()
  @IsOptional()
  ticketProductList: false | { product?: boolean }

  @Expose()
  @IsOptional()
  ticketProductConsumableList: false | { product?: boolean }

  @Expose()
  @IsOptional()
  ticketProductPrescriptionList: false | { product?: boolean }

  @Expose()
  @IsOptional()
  ticketBatchList: false | { batch?: boolean }

  @Expose()
  @IsOptional()
  ticketProcedureList: false | { procedure?: boolean }

  @Expose()
  @IsOptional()
  ticketLaboratoryGroupList: false | { laboratoryGroup?: boolean }

  @Expose()
  @IsOptional()
  ticketLaboratoryResultList: boolean

  @Expose()
  @IsOptional()
  ticketLaboratoryList: false | { laboratoryList?: boolean; laboratory?: boolean }

  @Expose()
  @IsOptional()
  ticketRadiologyList: false | { radiology?: boolean }

  @Expose()
  @IsOptional()
  ticketUserList: false | { user?: boolean }

  @Expose()
  @IsBoolean()
  toAppointment: boolean

  @Expose()
  @IsBoolean()
  customerSource: boolean
}

const ConditionEnumTicketType = createConditionEnum(TicketType)
const ConditionEnumTicketStatus = createConditionEnum(TicketStatus)

export class TicketFilterQuery {
  // @Expose()
  // @IsEnumValue(TicketStatus)
  // status: TicketStatus

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketStatus))
  @IsOptional()
  status: TicketStatus | InstanceType<typeof ConditionEnumTicketStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketType))
  @IsOptional()
  ticketType: TicketType | InstanceType<typeof ConditionEnumTicketType>

  @Expose()
  @IsNumber()
  customType: number

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

import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  SortQuery,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../_libs/common/dto'
import { TicketStatus, TicketType } from '../../../../../_libs/database/entities/ticket.entity'

export class TicketRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  customerPaymentList: boolean

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
  ticketProductList: false | { product?: boolean, batch?: boolean }

  @Expose()
  @IsOptional()
  ticketProductConsumableList: false | { product?: boolean, batch?: boolean }

  @Expose()
  @IsOptional()
  ticketProductPrescriptionList: false | { product?: boolean, batch?: boolean }

  @Expose()
  @IsOptional()
  ticketProcedureList: false | { procedure?: boolean }

  @Expose()
  @IsOptional()
  ticketLaboratoryList: false | { laboratoryList?: boolean }

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
  // ticketStatus: TicketStatus

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketStatus))
  @IsOptional()
  ticketStatus: TicketStatus | InstanceType<typeof ConditionEnumTicketStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketType))
  @IsOptional()
  ticketType: TicketType | InstanceType<typeof ConditionEnumTicketType>

  @Expose()
  @IsNumber()
  customerId: number

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

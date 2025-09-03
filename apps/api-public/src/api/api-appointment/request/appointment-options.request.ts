import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional, ValidateNested } from 'class-validator'
import { createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import {
  AppointmentStatus,
  AppointmentType,
} from '../../../../../_libs/database/entities/appointment.entity'
import { TicketProcedureGetManyQuery } from '../../api-ticket-procedure/request'

export class AppointmentRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  customerSource: boolean

  @Expose()
  @IsOptional()
  ticketProcedure?: TicketProcedureGetManyQuery

  @Expose()
  @IsBoolean()
  toTicket: boolean

  @Expose()
  @IsBoolean()
  ticketProcedureItem: boolean
}

const ConditionEnumAppointmentStatus = createConditionEnum(AppointmentStatus)

export class AppointmentFilterQuery {
  @Expose()
  @IsNumberGreaterThan(0)
  customerId: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, AppointmentStatus))
  @IsOptional()
  status: AppointmentStatus | InstanceType<typeof ConditionEnumAppointmentStatus>

  @Expose()
  @IsEnumValue(AppointmentType)
  type: AppointmentType

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp
}

export class AppointmentSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'
}

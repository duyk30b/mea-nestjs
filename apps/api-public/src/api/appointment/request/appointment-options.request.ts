import { createConditionEnum, transformConditionEnum } from '@libs/common/dto'
import { ConditionTimestamp } from '@libs/common/dto/condition-timestamp'
import { SortQuery } from '@libs/common/dto/query'
import {
  IsNumberGreaterThan,
} from '@libs/common/transform-validate/class-validator.custom'
import { AppointmentStatus } from '@libs/database/entities/appointment.entity'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional, ValidateNested } from 'class-validator'

export class AppointmentRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  toTicket: boolean
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
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp
}

export class AppointmentSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'
}

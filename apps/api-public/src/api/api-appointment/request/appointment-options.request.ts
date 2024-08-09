import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional, ValidateNested } from 'class-validator'
import { createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { AppointmentStatus, AppointmentType } from '../../../../../_libs/database/entities/appointment.entity'

export class AppointmentRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean
}

const ConditionEnumAppointmentType = createConditionEnum(AppointmentType)

export class AppointmentFilterQuery {
  @Expose()
  @IsNumberGreaterThan(0)
  customerId: number

  @Expose()
  @IsEnumValue(AppointmentStatus)
  appointmentStatus: AppointmentStatus

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, AppointmentType))
  @IsOptional()
  appointmentType: AppointmentType | InstanceType<typeof ConditionEnumAppointmentType>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  time: ConditionTimestamp
}

export class AppointmentSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  time: 'ASC' | 'DESC'
}

import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'
import {
  AppointmentFilterQuery,
  AppointmentRelationQuery,
  AppointmentSortQuery,
} from './appointment-options.request'

export class AppointmentGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<AppointmentRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(AppointmentRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: AppointmentRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<AppointmentFilterQuery>{
      customerId: 3,
      registeredAt: { GT: Date.now() },
      appointmentStatus: { IN: [AppointmentStatus.Confirm, AppointmentStatus.Waiting] },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(AppointmentFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: AppointmentFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<AppointmentSortQuery>{
      id: 'ASC',
      registeredAt: 'DESC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(AppointmentSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: AppointmentSortQuery
}

export class AppointmentPaginationQuery extends IntersectionType(
  AppointmentGetQuery,
  PaginationQuery
) { }

export class AppointmentGetManyQuery extends IntersectionType(
  PickType(AppointmentGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class AppointmentGetOneQuery extends PickType(AppointmentGetQuery, ['relation']) { }

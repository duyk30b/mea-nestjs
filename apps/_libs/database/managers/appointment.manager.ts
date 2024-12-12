import { Injectable } from '@nestjs/common'
import { Appointment } from '../entities'
import {
  AppointmentInsertType,
  AppointmentRelationType,
  AppointmentSortType,
  AppointmentUpdateType,
} from '../entities/appointment.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class AppointmentManager extends _PostgreSqlManager<
  Appointment,
  AppointmentRelationType,
  AppointmentInsertType,
  AppointmentUpdateType,
  AppointmentSortType
> {
  constructor() {
    super(Appointment)
  }
}

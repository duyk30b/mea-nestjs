import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Appointment } from '../entities'
import {
  AppointmentInsertType,
  AppointmentRelationType,
  AppointmentSortType,
  AppointmentUpdateType,
} from '../entities/appointment.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class AppointmentRepository extends _PostgreSqlRepository<
  Appointment,
  AppointmentRelationType,
  AppointmentInsertType,
  AppointmentUpdateType,
  AppointmentSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>
  ) {
    super(Appointment, appointmentRepository)
  }
}

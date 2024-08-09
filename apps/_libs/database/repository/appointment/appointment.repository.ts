import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Appointment } from '../../entities'
import { AppointmentInsertType, AppointmentRelationType, AppointmentSortType, AppointmentUpdateType } from '../../entities/appointment.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class AppointmentRepository extends PostgreSqlRepository<
  Appointment,
  { [P in keyof AppointmentSortType]?: 'ASC' | 'DESC' },
  { [P in keyof AppointmentRelationType]?: boolean },
  AppointmentInsertType,
  AppointmentUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>
  ) {
    super(appointmentRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<AppointmentInsertType>>(
    data: NoExtra<Partial<AppointmentInsertType>, X>
  ): Promise<Appointment> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Appointment.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends AppointmentInsertType>(
    data: NoExtra<AppointmentInsertType, X>
  ): Promise<Appointment> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Appointment.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<AppointmentUpdateType>>(
    condition: BaseCondition<Appointment>,
    data: NoExtra<Partial<AppointmentUpdateType>, X>
  ): Promise<Appointment[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Appointment.fromRaws(raws)
  }
}

import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { AppointmentStatus } from '../../../../_libs/database/entities/appointment.entity'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import { AppointmentRepository } from '../../../../_libs/database/repository/appointment/appointment.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  AppointmentCreateBody,
  AppointmentGetManyQuery,
  AppointmentGetOneQuery,
  AppointmentPaginationQuery,
  AppointmentRegisterTicketClinicBody,
  AppointmentUpdateBody,
} from './request'

@Injectable()
export class ApiAppointmentService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketRepository: TicketRepository
  ) { }

  async pagination(oid: number, query: AppointmentPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.appointmentRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        customerId: filter?.customerId,
        appointmentStatus: filter?.appointmentStatus,
        registeredAt: filter?.registeredAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: AppointmentGetManyQuery): Promise<BaseResponse> {
    const { limit, filter } = query

    const data = await this.appointmentRepository.findMany({
      condition: {
        oid,
        customerId: filter?.customerId,
        appointmentStatus: filter?.appointmentStatus,
        registeredAt: filter?.registeredAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, query?: AppointmentGetOneQuery): Promise<BaseResponse> {
    const appointment = await this.appointmentRepository.findOneBy({ oid, id })
    if (!appointment) {
      throw BusinessException.create({ message: 'error.Database.NotFound', details: 'Appointment' })
    }
    return { data: { appointment } }
  }

  async createOne(oid: number, body: AppointmentCreateBody): Promise<BaseResponse> {
    const appointment = await this.appointmentRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
      fromTicketId: body.fromTicketId,
      toTicketId: 0,
      cancelReason: '',
    })
    return { data: { appointment } }
  }

  async updateOne(oid: number, id: number, body: AppointmentUpdateBody): Promise<BaseResponse> {
    const [appointment] = await this.appointmentRepository.updateAndReturnEntity({ oid, id }, body)
    if (!appointment) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'Appointment',
      })
    }
    return { data: { appointment } }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.appointmentRepository.delete({
      oid,
      id,
      appointmentStatus: {
        IN: [AppointmentStatus.Waiting, AppointmentStatus.Confirm, AppointmentStatus.Cancelled],
      },
    })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: { appointmentId: id } }
  }

  async registerTicketClinic(options: {
    oid: number
    appointmentId: number
    body: AppointmentRegisterTicketClinicBody
  }): Promise<BaseResponse> {
    const { oid, appointmentId, body } = options
    const appointment = await this.appointmentRepository.findOneBy({ oid, id: appointmentId })
    const customer = await this.customerRepository.findOneBy({ oid, id: appointment.customerId })

    const ticket = await this.ticketRepository.insertOneAndReturnEntity({
      oid,
      customerId: customer.id,
      ticketStatus: TicketStatus.Schedule,
      ticketType: body.ticketType,
      registeredAt: body.registeredAt,
      note: appointment.reason,
    })

    ticket.customer = customer
    ticket.ticketDiagnosis = null
    ticket.ticketProductList = []
    ticket.ticketProcedureList = []
    ticket.customerPaymentList = []

    this.socketEmitService.ticketClinicCreate(oid, { ticket })

    await this.appointmentRepository.updateAndReturnEntity(
      { oid, id: appointmentId },
      {
        appointmentStatus: AppointmentStatus.Completed,
        toTicketId: ticket.id,
      }
    )
    return { data: { appointmentId } }
  }
}

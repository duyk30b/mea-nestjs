import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESTimer } from '../../../../_libs/common/helpers/time.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { DeliveryStatus, DiscountType } from '../../../../_libs/database/common/variable'
import { AppointmentStatus } from '../../../../_libs/database/entities/appointment.entity'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  AppointmentRepository,
  CustomerRepository,
  TicketAttributeRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
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
    private readonly ticketRepository: TicketRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository
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
    const { customerId: cid, customer, ...ticketBody } = body
    let customerId = cid
    if (!customerId) {
      let customerCode = body.customer.customerCode
      if (!customerCode) {
        const count = await this.customerRepository.getMaxId()
        customerCode = (count + 1).toString()
      }

      customerId = await this.customerRepository.insertOneFullField({
        ...body.customer,
        debt: 0,
        oid,
        customerCode,
      })
    }

    const appointment = await this.appointmentRepository.insertOneFullFieldAndReturnEntity({
      ...ticketBody,
      customerId,
      toTicketId: 0,
      cancelReason: '',
      oid,
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
    const countToday = await this.ticketRepository.countToday(oid)
    const registeredAt = body.registeredAt

    const ticket = await this.ticketRepository.insertOneFullFieldAndReturnEntity({
      oid,
      roomId: body.roomId,
      customerId: customer.id,
      status: TicketStatus.Schedule,
      registeredAt,
      dailyIndex: countToday + 1,
      year: ESTimer.info(registeredAt, 7).year,
      month: ESTimer.info(registeredAt, 7).month + 1,
      date: ESTimer.info(registeredAt, 7).date,

      customerSourceId: 0,
      debt: 0,
      note: '',
      deliveryStatus: DeliveryStatus.NoStock,
      procedureMoney: 0,
      productMoney: 0,
      radiologyMoney: 0,
      laboratoryMoney: 0,
      itemsCostAmount: 0,
      itemsDiscount: 0,
      itemsActualMoney: 0,
      discountMoney: 0,
      discountPercent: 0,
      discountType: DiscountType.Percent,
      surcharge: 0,
      totalMoney: 0,
      expense: 0,
      commissionMoney: 0,
      profit: 0,
      paid: 0,
      imageIds: JSON.stringify([]),
      startedAt: null,
      endedAt: null,
    })

    if (appointment.reason) {
      ticket.ticketAttributeList =
        await this.ticketAttributeRepository.insertManyFullFieldAndReturnEntity([
          {
            key: 'reason',
            value: appointment.reason || '',
            oid,
            ticketId: ticket.id,
          },
        ])
    }

    ticket.customer = customer

    this.socketEmitService.socketTicketChange(oid, { type: 'CREATE', ticket })

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

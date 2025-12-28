import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { ESTimer } from '../../../../_libs/common/helpers/time.helper'
import { DeliveryStatus, DiscountType } from '../../../../_libs/database/common/variable'
import { Customer, CustomerSource } from '../../../../_libs/database/entities'
import Appointment, {
  AppointmentStatus,
} from '../../../../_libs/database/entities/appointment.entity'
import { TicketPaymentDetailInsertType } from '../../../../_libs/database/entities/ticket-payment-detail.entity'
import Ticket, { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  AppointmentRepository,
  CustomerRepository,
  CustomerSourceRepository,
  TicketAttributeRepository,
  TicketPaymentDetailRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  AppointmentCreateBody,
  AppointmentGetManyQuery,
  AppointmentGetOneQuery,
  AppointmentPaginationQuery,
  AppointmentRegisterTicketClinicBody,
  AppointmentRelationQuery,
  AppointmentUpdateBody,
} from './request'

@Injectable()
export class ApiAppointmentService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly customerSourceRepository: CustomerSourceRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPaymentDetailRepository: TicketPaymentDetailRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository
  ) { }

  async pagination(oid: number, query: AppointmentPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: appointmentList, total } = await this.appointmentRepository.pagination({
      page,
      limit,
      // relation,
      condition: {
        oid,
        customerId: filter?.customerId,
        status: filter?.status,
        registeredAt: filter?.registeredAt,
      },
      sort,
    })
    if (relation) {
      await this.generateRelation({ oid, appointmentList, relation })
    }

    return { appointmentList, total, page, limit }
  }

  async getMany(oid: number, query: AppointmentGetManyQuery) {
    const { limit, filter, relation } = query

    const appointmentList = await this.appointmentRepository.findMany({
      condition: {
        oid,
        customerId: filter?.customerId,
        status: filter?.status,
        registeredAt: filter?.registeredAt,
      },
      limit,
    })
    if (relation) {
      await this.generateRelation({ oid, appointmentList, relation })
    }

    return { appointmentList }
  }

  async getOne(props: { oid: number; id: string; query?: AppointmentGetOneQuery }) {
    const { oid, id, query } = props
    const appointment = await this.appointmentRepository.findOneBy({ oid, id })
    if (!appointment) {
      throw BusinessException.create({ message: 'error.Database.NotFound', details: 'Appointment' })
    }
    if (query?.relation) {
      await this.generateRelation({ oid, appointmentList: [appointment], relation: query.relation })
    }

    return { appointment }
  }

  async generateRelation(options: {
    oid: number
    appointmentList: Appointment[]
    relation: AppointmentRelationQuery
  }) {
    const { oid, appointmentList, relation } = options
    const appointmentIdList = appointmentList.map((i) => i.id)
    const customerIdList = appointmentList.map((i) => i.customerId)
    const customerSourceIdList = appointmentList.map((i) => i.customerSourceId).filter((i) => !!i)

    const toTicketIdList = appointmentList.map((i) => i.toTicketId).filter((i) => !!i)

    const promiseData = await Promise.all([
      relation?.customer
        ? this.customerRepository.findManyBy({
          oid,
          id: { IN: ESArray.uniqueArray(customerIdList) },
        })
        : undefined,

      relation?.customerSource && customerSourceIdList.length
        ? this.customerSourceRepository.findManyBy({
          oid,
          id: { IN: ESArray.uniqueArray(customerSourceIdList) },
        })
        : undefined,
      relation?.toTicket && toTicketIdList.length
        ? this.ticketRepository.findManyBy({
          oid,
          id: { IN: ESArray.uniqueArray(toTicketIdList) },
        })
        : undefined,
    ])

    const customerList: Customer[] = promiseData[0]
    const customerSourceList: CustomerSource[] = promiseData[1]
    const toTicketList: Ticket[] = promiseData[2]

    const customerMap = ESArray.arrayToKeyValue(customerList || [], 'id')
    const customerSourceMap = ESArray.arrayToKeyValue(customerSourceList || [], 'id')
    const toTicketMap = ESArray.arrayToKeyValue(toTicketList || [], 'id')

    appointmentList.forEach((appointment: Appointment) => {
      if (relation?.customer) {
        appointment.customer = customerMap[appointment.customerId]
      }
      if (relation?.customerSource) {
        appointment.customerSource = customerSourceMap[appointment.customerSourceId]
      }
      if (relation?.toTicket) {
        appointment.toTicket = toTicketMap[appointment.toTicketId]
      }
    })
    return appointmentList
  }

  async createOne(oid: number, body: AppointmentCreateBody) {
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
      toTicketId: '0',
      cancelReason: '',
      oid,
    })
    return { appointment }
  }

  async updateOne(oid: number, id: string, body: AppointmentUpdateBody) {
    const [appointment] = await this.appointmentRepository.updateAndReturnEntity({ oid, id }, body)
    if (!appointment) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'Appointment',
      })
    }
    return { appointment }
  }

  async deleteOne(oid: number, id: string) {
    const affected = await this.appointmentRepository.delete({
      oid,
      id,
      status: {
        IN: [AppointmentStatus.Waiting, AppointmentStatus.Confirm, AppointmentStatus.Cancelled],
      },
    })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { appointmentId: id }
  }

  async registerTicketClinic(options: {
    oid: number
    appointmentId: string
    body: AppointmentRegisterTicketClinicBody
  }) {
    const { oid, appointmentId, body } = options

    const appointment = await this.appointmentRepository.findOneBy({ oid, id: appointmentId })
    const customer = await this.customerRepository.findOneBy({ oid, id: appointment.customerId })
    const receptionAt = body.receptionAt

    let ticket: Ticket
    if (!body.toTicketId) {
      const ticketIdGenerate = await this.ticketRepository.nextId({
        oid,
        createdAt: receptionAt,
      })
      const dailyIndex = Number(ticketIdGenerate.slice(-4))
      ticket = await this.ticketRepository.insertOneFullFieldAndReturnEntity({
        oid,
        id: ticketIdGenerate,
        roomId: body.roomId,
        isPaymentEachItem: body.isPaymentEachItem,
        customerId: customer.id,
        status: TicketStatus.Schedule,
        createdAt: receptionAt,
        receptionAt,
        dailyIndex,
        year: ESTimer.info(receptionAt, 7).year,
        month: ESTimer.info(receptionAt, 7).month + 1,
        date: ESTimer.info(receptionAt, 7).date,

        customerSourceId: 0,
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
        paidTotal: 0,
        debtTotal: 0,
        imageDiagnosisIds: JSON.stringify([]),
        endedAt: null,
      })
      if (body.isPaymentEachItem) {
        const ticketPaymentDetailInsert: TicketPaymentDetailInsertType = {
          oid,
          id: ticketIdGenerate,
          ticketId: ticketIdGenerate,
          paidWait: 0,
          paidItem: 0,
          paidSurcharge: 0,
          paidDiscount: 0,
          debtItem: 0,
          debtSurcharge: 0,
          debtDiscount: 0,
        }
        await this.ticketPaymentDetailRepository.insertOne(ticketPaymentDetailInsert)
      }
    } else {
      ticket = await this.ticketRepository.updateOneAndReturnEntity(
        { oid, id: body.toTicketId },
        { receptionAt: body.receptionAt }
      )
    }

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

    this.socketEmitService.socketTicketChange(oid, { ticketId: ticket.id, ticketModified: ticket })

    await this.appointmentRepository.updateAndReturnEntity(
      { oid, id: appointmentId },
      {
        status: AppointmentStatus.Completed,
        toTicketId: ticket.id,
      }
    )
    return { appointmentId }
  }
}

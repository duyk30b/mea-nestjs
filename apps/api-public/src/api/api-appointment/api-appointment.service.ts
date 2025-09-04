import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { ESTimer } from '../../../../_libs/common/helpers/time.helper'
import { DeliveryStatus, DiscountType } from '../../../../_libs/database/common/variable'
import {
  Customer,
  CustomerSource,
  TicketProcedure,
  TicketProcedureItem,
} from '../../../../_libs/database/entities'
import Appointment, {
  AppointmentStatus,
} from '../../../../_libs/database/entities/appointment.entity'
import Ticket, { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  AppointmentRepository,
  CustomerRepository,
  CustomerSourceRepository,
  TicketAttributeRepository,
  TicketProcedureItemRepository,
  TicketProcedureRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { ApiTicketProcedureService } from '../api-ticket-procedure/api-ticket-procedure.service'
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
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketProcedureItemRepository: TicketProcedureItemRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly apiTicketProcedureService: ApiTicketProcedureService
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
        type: filter?.type,
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
        type: filter?.type,
        registeredAt: filter?.registeredAt,
      },
      limit,
    })
    if (relation) {
      await this.generateRelation({ oid, appointmentList, relation })
    }

    return { appointmentList }
  }

  async getOne(oid: number, id: number, query?: AppointmentGetOneQuery) {
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
    const ticketProcedureIdList = appointmentList.map((i) => i.ticketProcedureId).filter((i) => !!i)

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
      relation?.ticketProcedure && ticketProcedureIdList.length
        ? this.apiTicketProcedureService.getList(oid, {
          filter: {
            ...(relation?.ticketProcedure.filter || {}),
            oid,
            id: { IN: ESArray.uniqueArray(ticketProcedureIdList) },
          },
          relation: relation?.ticketProcedure.relation,
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
    const ticketProcedureList: TicketProcedure[] = promiseData[2]?.ticketProcedureList || []
    const toTicketList: Ticket[] = promiseData[3]

    const customerMap = ESArray.arrayToKeyValue(customerList || [], 'id')
    const customerSourceMap = ESArray.arrayToKeyValue(customerSourceList || [], 'id')
    const ticketProcedureMap = ESArray.arrayToKeyValue(ticketProcedureList || [], 'id')
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
      if (relation?.ticketProcedure) {
        appointment.ticketProcedure = ticketProcedureMap[appointment.ticketProcedureId]
      }
      if (relation?.ticketProcedureItem) {
        if (appointment.ticketProcedure?.ticketProcedureItemList) {
          appointment.ticketProcedureItem =
            appointment.ticketProcedure.ticketProcedureItemList.find((i) => {
              return i.id === appointment.ticketProcedureItemId
            })
        }
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
      toTicketId: 0,
      cancelReason: '',
      oid,
      ticketProcedureId: 0,
      ticketProcedureItemId: 0,
    })
    return { appointment }
  }

  async updateOne(oid: number, id: number, body: AppointmentUpdateBody) {
    const [appointment] = await this.appointmentRepository.updateAndReturnEntity({ oid, id }, body)
    if (!appointment) {
      throw BusinessException.create({
        message: 'error.Database.UpdateFailed',
        details: 'Appointment',
      })
    }
    return { appointment }
  }

  async deleteOne(oid: number, id: number) {
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
    appointmentId: number
    body: AppointmentRegisterTicketClinicBody
  }) {
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
      imageDiagnosisIds: JSON.stringify([]),
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
        status: AppointmentStatus.Completed,
        toTicketId: ticket.id,
      }
    )
    return { appointmentId }
  }
}

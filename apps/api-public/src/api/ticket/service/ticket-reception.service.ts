import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESTimer } from '../../../../../_libs/common/helpers/time.helper'
import {
  DeliveryStatus,
  DiscountType,
} from '../../../../../_libs/database/common/variable'
import { Customer } from '../../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'
import { PositionInteractType } from '../../../../../_libs/database/entities/position.entity'
import { TicketAttributeInsertType } from '../../../../../_libs/database/entities/ticket-attribute.entity'
import {
  TicketProcedureInsertType,
  TicketProcedureStatus,
} from '../../../../../_libs/database/entities/ticket-procedure.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../_libs/database/operations'
import {
  AppointmentRepository,
  CustomerRepository,
  TicketAttributeRepository,
  TicketProcedureRepository,
  TicketRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketReceptionCreateTicketBody, TicketReceptionUpdateTicketBody } from '../request'
import { TicketUserService } from './ticket-user.service'

@Injectable()
export class TicketReceptionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketUserService: TicketUserService,
    private readonly ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async receptionCreate(options: { oid: number; body: TicketReceptionCreateTicketBody }) {
    const { oid, body } = options
    const { ticketReception } = body

    let customer: Customer
    if (!ticketReception.customerId) {
      let customerCode = body.customer.customerCode
      if (!customerCode) {
        const count = await this.customerRepository.getMaxId()
        customerCode = (count + 1).toString()
      }

      customer = await this.customerRepository.insertOneFullFieldAndReturnEntity({
        ...body.customer,
        debt: 0,
        oid,
        customerCode,
      })
      this.socketEmitService.customerUpsert(oid, { customer })
    } else {
      customer = await this.customerRepository.findOneBy({
        oid,
        id: ticketReception.customerId,
      })
    }
    if (!customer) throw new BusinessException('error.SystemError')

    const ticketListToday = await this.ticketRepository.findManyBy({
      oid,
      registeredAt: {
        GTE: ESTimer.startOfDate(ticketReception.registeredAt, 7).getTime(),
        LTE: ESTimer.endOfDate(ticketReception.registeredAt, 7).getTime(),
      },
    })
    let maxDailyIndex = 0
    ticketListToday.forEach((i) => {
      if (i.dailyIndex > maxDailyIndex) {
        maxDailyIndex = i.dailyIndex
      }
    })

    let ticket = await this.ticketRepository.insertOneFullFieldAndReturnEntity({
      oid,
      customerId: customer.id,
      roomId: ticketReception.roomId,
      ticketType: ticketReception.ticketType,
      status: ticketReception.status,
      registeredAt: ticketReception.registeredAt,
      startedAt:
        ticketReception.status === TicketStatus.Executing ? ticketReception.registeredAt : null,
      customerSourceId: ticketReception.customerSourceId,
      customType: ticketReception.customType,

      dailyIndex: maxDailyIndex + 1,
      year: ESTimer.info(ticketReception.registeredAt, 7).year,
      month: ESTimer.info(ticketReception.registeredAt, 7).month + 1,
      date: ESTimer.info(ticketReception.registeredAt, 7).date,

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
      discountType: DiscountType.VND,
      surcharge: 0,
      totalMoney: 0,
      expense: 0,
      commissionMoney: 0,
      profit: 0,
      paid: 0,
      imageIds: JSON.stringify([]),
      endedAt: null,
    })
    ticket.customer = customer

    if (ticketReception.fromAppointmentId) {
      await this.appointmentRepository.update(
        { oid, id: ticketReception.fromAppointmentId },
        {
          toTicketId: ticket.id,
          appointmentStatus: AppointmentStatus.Completed,
        }
      )
    }

    if (body.ticketAttributeList) {
      const ticketAttributeInsertList = body.ticketAttributeList
        .filter((i) => !!i.value)
        .map((i) => {
          const dto: TicketAttributeInsertType = {
            ...i,
            oid,
            ticketId: ticket.id,
          }
          return dto
        })
      ticket.ticketAttributeList =
        await this.ticketAttributeRepository.insertManyAndReturnEntity(ticketAttributeInsertList)
    }

    if (body.ticketUserList) {
      this.ticketUserService.changeTicketUserList({
        oid,
        ticketId: ticket.id,
        body: {
          positionType: PositionInteractType.Ticket,
          positionInteractId: 0,
          ticketItemId: 0,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }

    if (body.ticketProcedureList?.length) {
      const ticketProcedureInsertList = body.ticketProcedureList!.map((i) => {
        const insert: TicketProcedureInsertType = {
          ...i,
          customerId: ticket.customerId,
          status: TicketProcedureStatus.Completed,
          oid,
          imageIds: JSON.stringify([]),
          startedAt: Date.now(),
          ticketId: ticket.id,
          result: '',
        }
        return insert
      })
      const ticketProcedureCreatedList =
        await this.ticketProcedureRepository.insertManyAndReturnEntity(ticketProcedureInsertList)
      const procedureMoney = ticketProcedureCreatedList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.actualPrice
      }, 0)
      const procedureDiscount = ticketProcedureCreatedList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.discountMoney
      }, 0)
      ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
        manager: this.ticketRepository.getManager(),
        oid,
        ticketOrigin: ticket,
        itemMoney: {
          procedureMoneyAdd: procedureMoney,
          itemsDiscountAdd: procedureDiscount,
        },
      })
    }

    this.socketEmitService.socketTicketChange(oid, { type: 'CREATE', ticket })
    return { ticket }
  }

  async receptionUpdate(options: {
    oid: number
    ticketId: number
    body: TicketReceptionUpdateTicketBody
  }) {
    const { oid, body, ticketId } = options
    const { ticketReception } = body
    const registeredTime = ESTimer.info(ticketReception.registeredAt, 7)

    const ticketModified = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      {
        registeredAt: ticketReception.registeredAt,
        customerSourceId: ticketReception.customerSourceId,
        customType: ticketReception.customType,
        roomId: ticketReception.roomId,
        year: registeredTime.year,
        month: registeredTime.month + 1,
        date: registeredTime.date,
        updatedAt: Date.now(),
      }
    )

    if (body.ticketAttributeList) {
      const attributeKeyRemove = body.ticketAttributeList.map((i) => i.key)
      if (attributeKeyRemove.length) {
        await this.ticketAttributeRepository.delete({
          oid,
          ticketId,
          key: { IN: body.ticketAttributeList.map((i) => i.key) },
        })
      }

      const ticketAttributeInsertList = body.ticketAttributeList
        .filter((i) => !!i.value)
        .map((i) => {
          const dto: TicketAttributeInsertType = {
            ...i,
            oid,
            ticketId,
          }
          return dto
        })
      await this.ticketAttributeRepository.insertMany(ticketAttributeInsertList)
      ticketModified.ticketAttributeList = await this.ticketAttributeRepository.findManyBy({
        oid,
        ticketId,
      })
    }

    if (body.ticketUserList) {
      this.ticketUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          positionType: PositionInteractType.Ticket,
          positionInteractId: 0,
          ticketItemId: 0,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }

    ticketModified.customer = await this.customerRepository.findOneById(ticketModified.customerId)

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    return { ticket: ticketModified }
  }
}

import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESTimer } from '../../../../../_libs/common/helpers/time.helper'
import { DeliveryStatus, DiscountType } from '../../../../../_libs/database/common/variable'
import { Customer } from '../../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'
import { PositionType } from '../../../../../_libs/database/entities/position.entity'
import { TicketAttributeInsertType } from '../../../../../_libs/database/entities/ticket-attribute.entity'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  TicketAddTicketProcedureListOperation,
  TicketChangeTicketUserOperation,
} from '../../../../../_libs/database/operations'
import {
  AppointmentRepository,
  CustomerRepository,
  TicketAttributeRepository,
  TicketRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketReceptionCreateTicketBody, TicketReceptionUpdateTicketBody } from './request'

@Injectable()
export class TicketReceptionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketChangeTicketUserOperation: TicketChangeTicketUserOperation,
    private readonly ticketAddTicketProcedureListOperation: TicketAddTicketProcedureListOperation
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

    const ticket = await this.ticketRepository.insertOneFullFieldAndReturnEntity({
      oid,
      customerId: customer.id,
      roomId: ticketReception.roomId,
      status: ticketReception.status,
      registeredAt: ticketReception.registeredAt,
      startedAt:
        ticketReception.status === TicketStatus.Executing ? ticketReception.registeredAt : null,
      customerSourceId: ticketReception.customerSourceId,

      dailyIndex: maxDailyIndex + 1,
      year: ESTimer.info(ticketReception.registeredAt, 7).year,
      month: ESTimer.info(ticketReception.registeredAt, 7).month + 1,
      date: ESTimer.info(ticketReception.registeredAt, 7).date,

      debt: 0,
      note: ticketReception.note,
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
      imageDiagnosisIds: JSON.stringify([]),
      endedAt: null,
    })

    if (ticketReception.fromAppointmentId) {
      await this.appointmentRepository.update(
        { oid, id: ticketReception.fromAppointmentId },
        {
          toTicketId: ticket.id,
          status: AppointmentStatus.Completed,
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

    if (body.ticketUserReceptionList) {
      const responseChangeUser = await this.ticketChangeTicketUserOperation.changeTicketUserList({
        oid,
        ticketId: ticket.id,
        createdAt: ticket.registeredAt,
        ticketUserDtoList: body.ticketUserReceptionList
          .filter((i) => !!i.userId)
          .map((i) => {
            return {
              ...i,
              ticketItemId: 0,
              ticketItemChildId: 0,
              ticketItemExpectedPrice: ticket.totalMoney + ticket.discountMoney,
              ticketItemActualPrice: ticket.totalMoney,
              positionInteractId: 0,
              quantity: 1,
            }
          }),
      })
      ticket.ticketUserList = responseChangeUser.ticketUserCreatedList
    }

    if (body.ticketProcedureWrapList?.length) {
      const result = await this.ticketAddTicketProcedureListOperation.addTicketProcedureList({
        oid,
        ticketId: ticket.id,
        ticketProcedureDtoList: body.ticketProcedureWrapList.map((i) => {
          return {
            ticketProcedureAdd: i.ticketProcedure,
            ticketProcedureItemAddList: i.ticketProcedureItemList,
            ticketUserRequestAddList: i.ticketUserRequestList,
          }
        }),
      })

      Object.assign(ticket, result.ticketModified)
      ticket.ticketProcedureList = result.ticketProcedureCreatedList
    }

    ticket.customer = customer
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
        roomId: ticketReception.roomId,
        note: ticketReception.note,
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

    if (body.ticketUserReceptionList) {
      const responseChangeUser = await this.ticketChangeTicketUserOperation.changeTicketUserList({
        oid,
        ticketId,
        createdAt: ticketModified.registeredAt,
        ticketUserDtoList: body.ticketUserReceptionList
          .filter((i) => !!i.userId)
          .map((i) => {
            return {
              ...i,
              ticketItemId: 0,
              ticketItemChildId: 0,
              ticketItemExpectedPrice: ticketModified.totalMoney + ticketModified.discountMoney,
              ticketItemActualPrice: ticketModified.totalMoney,
              positionInteractId: 0,
              quantity: 1,
            }
          }),
        destroy: {
          positionType: PositionType.TicketReception,
          ticketItemId: 0,
          ticketItemChildId: 0,
        },
      })
      this.socketEmitService.socketTicketUserListChange(oid, {
        ticketId,
        ticketUserDestroyedList: responseChangeUser.ticketUserDestroyedList,
        ticketUserUpsertedList: responseChangeUser.ticketUserCreatedList,
      })
    }

    ticketModified.customer = await this.customerRepository.findOneById(ticketModified.customerId)

    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: ticketModified })
    return { ticket: ticketModified }
  }
}

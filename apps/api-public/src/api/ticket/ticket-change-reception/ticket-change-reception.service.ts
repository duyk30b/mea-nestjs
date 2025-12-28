import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESTimer } from '../../../../../_libs/common/helpers/time.helper'
import { BusinessError } from '../../../../../_libs/database/common/error'
import { GenerateId } from '../../../../../_libs/database/common/generate-id'
import { DeliveryStatus, DiscountType } from '../../../../../_libs/database/common/variable'
import { Customer, TicketUser } from '../../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'
import { PositionType } from '../../../../../_libs/database/entities/position.entity'
import { TicketAttributeInsertType } from '../../../../../_libs/database/entities/ticket-attribute.entity'
import { TicketPaymentDetailInsertType } from '../../../../../_libs/database/entities/ticket-payment-detail.entity'
import { TicketReceptionInsertType } from '../../../../../_libs/database/entities/ticket-reception.entity'
import Ticket, { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'
import {
  TicketChangeTicketUserOperation,
  TicketUserAddType,
} from '../../../../../_libs/database/operations'
import {
  AppointmentRepository,
  CustomerRepository,
  TicketAttributeRepository,
  TicketPaymentDetailRepository,
  TicketReceptionRepository,
  TicketRepository,
} from '../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import { TicketDestroyService } from '../ticket-action/ticket-destroy.service'
import { TicketAddTicketProcedureListService } from '../ticket-change-procedure/service/ticket-add-ticket-procedure-list.service'
import { TicketCreateTicketReceptionBody, TicketUpdateTicketReceptionBody } from './request'

@Injectable()
export class TicketChangeReceptionService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketPaymentDetailRepository: TicketPaymentDetailRepository,
    private readonly ticketReceptionRepository: TicketReceptionRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketChangeTicketUserOperation: TicketChangeTicketUserOperation,
    private readonly ticketAddTicketProcedureListService: TicketAddTicketProcedureListService,
    private readonly ticketDestroyService: TicketDestroyService
  ) { }

  async receptionCreate(options: { oid: number; body: TicketCreateTicketReceptionBody }) {
    const { oid, body } = options
    const { ticketReceptionAdd } = body

    let customer: Customer
    let ticket: Ticket

    if (!body.customerId) {
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
        id: body.customerId,
      })
    }
    if (!customer) throw new BusinessException('error.SystemError')

    if (!body.ticketId) {
      const ticketIdGenerate = await this.ticketRepository.nextId({
        oid,
        createdAt: ticketReceptionAdd.receptionAt,
      })
      const dailyIndex = Number(ticketIdGenerate.slice(-4))
      ticket = await this.ticketRepository.insertOneFullFieldAndReturnEntity({
        oid,
        id: ticketIdGenerate,
        customerId: customer.id,
        isPaymentEachItem: body.isPaymentEachItem,
        roomId: ticketReceptionAdd.roomId,
        status: body.status,
        createdAt: ticketReceptionAdd.receptionAt,
        receptionAt: ticketReceptionAdd.receptionAt,
        customerSourceId: ticketReceptionAdd.customerSourceId,

        dailyIndex,
        year: ESTimer.info(ticketReceptionAdd.receptionAt, 7).year,
        month: ESTimer.info(ticketReceptionAdd.receptionAt, 7).month + 1,
        date: ESTimer.info(ticketReceptionAdd.receptionAt, 7).date,

        note: ticketReceptionAdd.reason,
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
    }
    if (body.ticketId) {
      ticket = await this.ticketRepository.updateOneAndReturnEntity(
        {
          oid,
          id: body.ticketId,
          customerId: customer.id,
        },
        { receptionAt: ticketReceptionAdd.receptionAt }
      )
    }

    if (body.fromAppointmentId) {
      await this.appointmentRepository.updateBasic(
        { oid, id: body.fromAppointmentId },
        {
          toTicketId: ticket.id,
          status: AppointmentStatus.Completed,
        }
      )
    }

    if (body.ticketAttributeAddList) {
      const ticketAttributeInsertList = body.ticketAttributeAddList
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

    const ticketReceptionInsert: TicketReceptionInsertType = {
      oid,
      customerId: customer.id,
      customerSourceId: ticketReceptionAdd.customerSourceId,
      roomId: ticketReceptionAdd.roomId,
      receptionAt: ticketReceptionAdd.receptionAt,
      reason: ticketReceptionAdd.reason,
      ticketId: ticket.id,
      isFirstReception: body.ticketId ? 0 : 1,
    }
    const ticketReceptionCreated =
      await this.ticketReceptionRepository.insertOneAndReturnEntity(ticketReceptionInsert)

    if (body.ticketUserReceptionAddList) {
      const responseChangeUser = await this.ticketChangeTicketUserOperation.changeTicketUserList({
        oid,
        ticketId: ticket.id,
        createdAt: ticket.createdAt,
        ticketUserDtoList: body.ticketUserReceptionAddList
          .filter((i) => !!i.userId)
          .map((i) => {
            const temp: TicketUserAddType = {
              positionId: i.positionId,
              userId: i.userId,
              ticketItemId: ticketReceptionCreated.id,
              ticketItemExpectedPrice: ticket.totalMoney + ticket.discountMoney,
              ticketItemActualPrice: ticket.totalMoney,
              positionInteractId: 0,
              quantity: 1,
            }
            return temp
          }),
      })
      ticket.ticketUserList = responseChangeUser.ticketUserCreatedList
    }

    if (body.ticketProcedureWrapList?.length || body.ticketRegimenWrapList?.length) {
      const result = await this.ticketAddTicketProcedureListService.addTicketProcedureList({
        oid,
        ticketId: ticket.id,
        body: {
          ticketRegimenWrapList: body.ticketRegimenWrapList.map((i) => {
            return {
              ticketRegimenAdd: {
                ...i.ticketRegimenAdd,
                id: GenerateId.nextId(),
              },
              ticketRegimenItemAddList: i.ticketRegimenItemAddList,
              ticketUserRequestAddList: i.ticketUserRequestAddList,
            }
          }),
          ticketProcedureWrapList: body.ticketProcedureWrapList.map((i) => {
            return {
              ticketProcedureAdd: {
                ...i.ticketProcedureAdd,
                id: GenerateId.nextId(),
              },
              ticketUserRequestAddList: i.ticketUserRequestAddList,
            }
          }),
        },
      })

      Object.assign(ticket, result.ticketModified)
      ticket.ticketProcedureList = result.ticketProcedureCreatedList
      ticket.ticketRegimenList = result.ticketRegimenCreatedList
    }

    ticket.customer = customer
    ticket.ticketReceptionList = await this.ticketReceptionRepository.findManyBy({
      oid,
      ticketId: ticket.id,
    })
    this.socketEmitService.socketRoomTicketPaginationChange(oid, {
      roomId: ticket.roomId,
    })
    return { ticket, ticketReceptionCreated }
  }

  async receptionDestroy(obj: { oid: number; ticketId: string; ticketReceptionId: string }) {
    const { oid, ticketId, ticketReceptionId } = obj
    const ticket = await this.ticketRepository.findOneBy({ oid, id: ticketId })

    if (
      [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Cancelled].includes(ticket.status)
    ) {
      await this.ticketDestroyService.destroy({ oid, ticketId })
      this.socketEmitService.socketRoomTicketPaginationChange(oid, { roomId: ticket.roomId })
      return { ticketDestroyedId: ticketId }
    }

    const ticketReceptionList = await this.ticketReceptionRepository.findManyBy({
      oid,
      ticketId: ticket.id,
    })
    const findIndex = ticketReceptionList.findIndex((i) => {
      return i.id === ticketReceptionId && !i.isFirstReception
    })
    if (findIndex === -1) {
      throw new BusinessError('Phiếu khám đã hoạt động, không thể xóa')
    }

    await this.ticketReceptionRepository.deleteOneAndReturnEntity({ oid, id: ticketReceptionId })
    ticketReceptionList.splice(findIndex, 1)
    ticket.ticketReceptionList = ticketReceptionList
    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketReception: { upsertedList: ticket.ticketReceptionList },
      ticketModified: ticket,
    })
    return { ticket }
  }

  async receptionUpdate(options: {
    oid: number
    ticketId: string
    ticketReceptionId: string
    body: TicketUpdateTicketReceptionBody
  }) {
    const { oid, body, ticketId, ticketReceptionId } = options
    const { ticketReceptionUpdate } = body
    const receptionTime = ESTimer.info(ticketReceptionUpdate.receptionAt, 7)

    const ticketReceptionModified = await this.ticketReceptionRepository.updateOneAndReturnEntity(
      { oid, id: ticketReceptionId },
      {
        roomId: ticketReceptionUpdate.roomId,
        customerSourceId: ticketReceptionUpdate.customerSourceId,
        receptionAt: ticketReceptionUpdate.receptionAt,
        reason: ticketReceptionUpdate.reason,
      }
    )

    const ticketModified = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      {
        receptionAt: ticketReceptionUpdate.receptionAt,
        createdAt: ticketReceptionModified.isFirstReception
          ? ticketReceptionUpdate.receptionAt
          : undefined,
        customerSourceId: ticketReceptionModified.isFirstReception
          ? ticketReceptionUpdate.customerSourceId
          : undefined,
        roomId: ticketReceptionModified.isFirstReception ? ticketReceptionUpdate.roomId : undefined,
        year: ticketReceptionModified.isFirstReception ? receptionTime.year : undefined,
        month: ticketReceptionModified.isFirstReception ? receptionTime.month + 1 : undefined,
        date: ticketReceptionModified.isFirstReception ? receptionTime.date : undefined,
      }
    )

    if (body.ticketAttributeUpdateList) {
      const attributeKeyRemove = body.ticketAttributeUpdateList.map((i) => i.key)
      if (attributeKeyRemove.length) {
        await this.ticketAttributeRepository.delete({
          oid,
          ticketId,
          key: { IN: body.ticketAttributeUpdateList.map((i) => i.key) },
        })
      }

      const ticketAttributeInsertList = body.ticketAttributeUpdateList
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

    let ticketUserDestroyedList: TicketUser[] = []
    let ticketUserCreatedList: TicketUser[] = []
    if (body.ticketUserReceptionUpdateList) {
      const responseChangeUser = await this.ticketChangeTicketUserOperation.changeTicketUserList({
        oid,
        ticketId,
        createdAt: ticketModified.createdAt,
        ticketUserDtoList: body.ticketUserReceptionUpdateList
          .filter((i) => !!i.userId)
          .map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              ticketItemId: ticketReceptionId,
              ticketItemChildId: 0,
              ticketItemExpectedPrice: ticketModified.totalMoney + ticketModified.discountMoney,
              ticketItemActualPrice: ticketModified.totalMoney,
              positionInteractId: 0,
              quantity: 1,
            }
          }),
        destroy: {
          positionType: PositionType.Reception,
          ticketItemId: ticketReceptionId,
        },
      })
      ticketUserCreatedList = responseChangeUser.ticketUserCreatedList
      ticketUserDestroyedList = responseChangeUser.ticketUserDestroyedList
    }

    ticketModified.ticketReceptionList = await this.ticketReceptionRepository.findManyBy({
      oid,
      ticketId,
    })

    this.socketEmitService.socketTicketChange(oid, {
      ticketId,
      ticketModified,
      ticketReception: { upsertedList: [ticketReceptionModified] },
      ticketUser: {
        destroyedList: ticketUserDestroyedList,
        upsertedList: ticketUserCreatedList,
      },
    })

    return { ticketModified, ticketReceptionModified }
  }
}

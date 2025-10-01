import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus } from '../../../../../../_libs/database/common/variable'
import { TicketRegimen, TicketRegimenItem } from '../../../../../../_libs/database/entities'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import {
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import {
  TicketProcedureRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'

@Injectable()
export class TicketDestroyTicketProcedureService {
  constructor(
    private dataSource: DataSource,
    private readonly socketEmitService: SocketEmitService,
    private ticketRepository: TicketRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketProcedure(params: {
    oid: number
    ticketId: string
    ticketProcedureId: string
  }) {
    const { oid, ticketId, ticketProcedureId } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET PROCEDURE ===
      const ticketProcedureDestroyed = await this.ticketProcedureRepository.managerDeleteOne(
        manager,
        {
          oid,
          ticketId,
          id: ticketProcedureId,
          paymentMoneyStatus: {
            IN: [
              PaymentMoneyStatus.NoEffect,
              PaymentMoneyStatus.TicketPaid,
              PaymentMoneyStatus.PendingPayment,
            ],
          },
          status: {
            IN: [TicketProcedureStatus.NoEffect, TicketProcedureStatus.Pending],
          },
          costAmount: 0, // nếu có costAmount thì phải hủy kết quả trước
        }
      )

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
        oid,
        ticketId,
        positionType: {
          IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult],
        },
        ticketItemId: ticketProcedureDestroyed.id,
      })

      // Khi hủy kết quả rồi thì không còn bản ghi vật tư rồi
      // const ticketProductDestroyedList = await this.ticketProductRepository.managerDelete(manager, {
      //   oid,
      //   ticketId,
      //   type: TicketProductType.Procedure,
      //   ticketProcedureId: ticketProcedureDestroyed.id,
      // })

      // === 4. UPDATE TICKET: MONEY  ===
      const commissionMoneyDelete = ticketUserDestroyedList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let procedureMoneyDelete = 0
      let itemsDiscountDelete = 0
      let remainingMoneyAdd = 0 // remainingMoney của ticketRegimen thay đổi theo khi có isPaymentEachItem
      if (ticketProcedureDestroyed.status !== TicketProcedureStatus.NoEffect) {
        procedureMoneyDelete =
          ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.actualPrice
        itemsDiscountDelete =
          ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.discountMoney
      }

      let ticketRegimenModified: TicketRegimen
      let ticketRegimenItemModified: TicketRegimenItem
      if (ticketProcedureDestroyed.ticketProcedureType === TicketProcedureType.InRegimen) {
        let quantityPaymentDelete = 0
        if (ticketProcedureDestroyed.status !== TicketProcedureStatus.NoEffect) {
          quantityPaymentDelete = ticketProcedureDestroyed.quantity
          if (ticketOrigin.isPaymentEachItem) {
            remainingMoneyAdd = procedureMoneyDelete
          }
        }

        ticketRegimenItemModified = await this.ticketRegimenItemRepository.managerUpdateOne(
          manager,
          { oid, id: ticketProcedureDestroyed.ticketRegimenItemId },
          {
            quantityPayment: () => `quantityPayment - ${quantityPaymentDelete}`,
            quantityExpected: () => `quantityExpected - ${ticketProcedureDestroyed.quantity}`,
            paymentMoneyAmount: () =>
              `paymentMoneyAmount - ${ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.actualPrice}`,
            expectedMoneyAmount: () =>
              `expectedMoneyAmount - ${ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.expectedPrice}`,
            discountMoneyAmount: () =>
              `discountMoneyAmount - ${ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.discountMoney}`,
            actualMoneyAmount: () =>
              `actualMoneyAmount - ${ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.actualPrice}`,
          }
        )

        ticketRegimenModified = await this.ticketRegimenRepository.managerUpdateOne(
          manager,
          { oid, id: ticketProcedureDestroyed.ticketRegimenId },
          {
            expectedMoney: () =>
              `expectedMoney - ${ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.expectedPrice}`,
            actualMoney: () =>
              `actualMoney - ${ticketProcedureDestroyed.quantity * ticketProcedureDestroyed.actualPrice}`,
            discountMoney: () => `discountMoney - ${itemsDiscountDelete}`,
            commissionAmount: () => `commissionAmount - ${commissionMoneyDelete}`,
            spentMoney: () => `spentMoney - ${procedureMoneyDelete}`,
            remainingMoney: () => `remainingMoney + ${remainingMoneyAdd}`,
          }
        )
      }

      let ticketModified: Ticket = ticketOrigin
      if (procedureMoneyDelete != 0 || itemsDiscountDelete != 0 || commissionMoneyDelete != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: -procedureMoneyDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketUser: {
          destroyedList: ticketUserDestroyedList || [],
        },
        ticketProcedure: { destroyedList: [ticketProcedureDestroyed] },
        ticketRegimen: { upsertedList: ticketRegimenModified ? [ticketRegimenModified] : [] },
        ticketRegimenItem: {
          upsertedList: ticketRegimenItemModified ? [ticketRegimenItemModified] : [],
        },
      })

      return { ticketModified, ticketProcedureDestroyed, ticketUserDestroyedList }
    })

    return transaction
  }
}

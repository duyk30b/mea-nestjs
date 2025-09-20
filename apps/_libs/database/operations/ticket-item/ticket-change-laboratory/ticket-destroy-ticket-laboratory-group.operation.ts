import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus } from '../../../common/variable'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
    TicketLaboratoryGroupManager,
    TicketLaboratoryManager,
    TicketLaboratoryResultManager,
    TicketManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketDestroyTicketLaboratoryGroupOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketLaboratoryGroupManager: TicketLaboratoryGroupManager,
    private ticketLaboratoryResultManager: TicketLaboratoryResultManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketLaboratoryGroup(params: {
    oid: number
    ticketId: number
    ticketLaboratoryGroupId: number
  }) {
    const { oid, ticketId, ticketLaboratoryGroupId } = params
    const PREFIX = `ticketId=${ticketLaboratoryGroupId} destroyTicketLaboratoryGroup failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET LABORATORY ===
      const ticketLaboratoryGroupDestroyed =
        await this.ticketLaboratoryGroupManager.deleteOneAndReturnEntity(manager, {
          oid,
          ticketId,
          id: ticketLaboratoryGroupId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.PendingPayment, PaymentMoneyStatus.TicketPaid] },
        })

      const ticketLaboratoryDestroyedList =
        await this.ticketLaboratoryManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          ticketLaboratoryGroupId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.PendingPayment, PaymentMoneyStatus.TicketPaid] },
        })

      const ticketLaboratoryResultDestroyedList =
        await this.ticketLaboratoryResultManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          ticketLaboratoryGroupId,
        })

      // === 4. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyDelete = ticketLaboratoryDestroyedList.reduce(
        (acc, item) => acc + item.actualPrice,
        0
      )
      const itemsDiscountDelete = ticketLaboratoryDestroyedList.reduce(
        (acc, item) => acc + item.discountMoney,
        0
      )
      const itemsCostAmountDelete = ticketLaboratoryDestroyedList.reduce(
        (acc, item) => acc + item.costPrice,
        0
      )

      let ticket: Ticket = ticketOrigin
      if (laboratoryMoneyDelete != 0 || itemsDiscountDelete != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            laboratoryMoneyAdd: -laboratoryMoneyDelete,
            itemsCostAmountAdd: -itemsCostAmountDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
          },
        })
      }

      return {
        ticket,
        ticketLaboratoryDestroyedList,
        ticketLaboratoryGroupDestroyed,
        ticketLaboratoryResultDestroyedList,
      }
    })

    return transaction
  }
}

import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus, TicketLaboratoryStatus } from '../../../common/variable'
import { TicketLaboratoryGroup } from '../../../entities'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketLaboratoryGroupManager,
  TicketLaboratoryManager,
  TicketLaboratoryResultManager,
  TicketManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketDestroyTicketLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketLaboratoryGroupManager: TicketLaboratoryGroupManager,
    private ticketLaboratoryResultManager: TicketLaboratoryResultManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketLaboratory(params: {
    oid: number
    ticketId: string
    ticketLaboratoryId: string
  }) {
    const { oid, ticketId, ticketLaboratoryId } = params
    const PREFIX = `ticketId=${ticketId} destroyTicketLaboratory failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET LABORATORY ===
      const ticketLaboratoryDestroyed = await this.ticketLaboratoryManager.deleteOneAndReturnEntity(
        manager,
        {
          oid,
          ticketId,
          id: ticketLaboratoryId,
          status: TicketLaboratoryStatus.Pending,
          paymentMoneyStatus: PaymentMoneyStatus.PendingPaid,
        }
      )

      const ticketLaboratoryResultDestroyedList =
        await this.ticketLaboratoryResultManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          ticketLaboratoryGroupId: ticketLaboratoryDestroyed.ticketLaboratoryGroupId,
          ticketLaboratoryId: ticketLaboratoryDestroyed.id,
          laboratoryId: ticketLaboratoryDestroyed.laboratoryId,
        })

      const ticketLaboratoryRemainList = await this.ticketLaboratoryManager.findManyBy(manager, {
        oid,
        ticketId,
        ticketLaboratoryGroupId: ticketLaboratoryDestroyed.ticketLaboratoryGroupId,
      })
      let ticketLaboratoryGroupDestroyed: TicketLaboratoryGroup | null = null
      let ticketLaboratoryGroupModified: TicketLaboratoryGroup | null = null
      if (!ticketLaboratoryRemainList.length) {
        ticketLaboratoryGroupDestroyed =
          await this.ticketLaboratoryGroupManager.deleteOneAndReturnEntity(manager, {
            oid,
            ticketId,
            id: ticketLaboratoryDestroyed.ticketLaboratoryGroupId,
          })
      } else {
        const { paymentMoneyStatus } =
          this.ticketLaboratoryGroupManager.calculatorPaymentMoneyStatus({
            ticketLaboratoryList: ticketLaboratoryRemainList,
          })
        ticketLaboratoryGroupModified =
          await this.ticketLaboratoryGroupManager.updateOneAndReturnEntity(
            manager,
            {
              oid,
              ticketId,
              id: ticketLaboratoryDestroyed.ticketLaboratoryGroupId,
            },
            { paymentMoneyStatus }
          )
      }

      // === 4. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyDelete = ticketLaboratoryDestroyed.actualPrice
      const itemsDiscountDelete = ticketLaboratoryDestroyed.discountMoney
      const itemsCostAmountDelete = ticketLaboratoryDestroyed.costPrice

      let ticketModified: Ticket = ticketOrigin
      if (laboratoryMoneyDelete != 0 || itemsDiscountDelete != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
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
        ticketModified,
        ticketLaboratoryDestroyed,
        ticketLaboratoryGroupDestroyed: ticketLaboratoryGroupDestroyed as TicketLaboratoryGroup | null,
        ticketLaboratoryGroupModified: ticketLaboratoryGroupModified as TicketLaboratoryGroup | null,
        ticketLaboratoryResultDestroyedList,
      }
    })

    return transaction
  }
}

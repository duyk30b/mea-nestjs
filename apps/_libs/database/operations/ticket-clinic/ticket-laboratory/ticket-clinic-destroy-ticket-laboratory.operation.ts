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
} from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketClinicDestroyTicketLaboratoryOperation {
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
    ticketId: number
    ticketLaboratoryId: number
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
      const ticketLaboratoryDestroy = await this.ticketLaboratoryManager.deleteOneAndReturnEntity(
        manager,
        {
          oid,
          ticketId,
          id: ticketLaboratoryId,
          status: TicketLaboratoryStatus.Pending,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        }
      )

      const ticketLaboratoryResultDestroyList =
        await this.ticketLaboratoryResultManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          ticketLaboratoryGroupId: ticketLaboratoryDestroy.ticketLaboratoryGroupId,
          ticketLaboratoryId: ticketLaboratoryDestroy.id,
          laboratoryId: ticketLaboratoryDestroy.laboratoryId,
        })

      const ticketLaboratoryRemainList = await this.ticketLaboratoryManager.findManyBy(manager, {
        oid,
        ticketId,
        ticketLaboratoryGroupId: ticketLaboratoryDestroy.ticketLaboratoryGroupId,
      })
      let ticketLaboratoryGroupDestroy: TicketLaboratoryGroup | null = null
      let ticketLaboratoryGroupModified: TicketLaboratoryGroup | null = null
      if (!ticketLaboratoryRemainList.length) {
        ticketLaboratoryGroupDestroy =
          await this.ticketLaboratoryGroupManager.deleteOneAndReturnEntity(manager, {
            oid,
            ticketId,
            id: ticketLaboratoryDestroy.ticketLaboratoryGroupId,
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
              id: ticketLaboratoryDestroy.ticketLaboratoryGroupId,
            },
            { paymentMoneyStatus }
          )
      }

      // === 4. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyDelete = ticketLaboratoryDestroy.actualPrice
      const itemsDiscountDelete = ticketLaboratoryDestroy.discountMoney
      const itemsCostAmountDelete = ticketLaboratoryDestroy.costPrice

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
        ticketLaboratoryDestroy,
        ticketLaboratoryGroupDestroy: ticketLaboratoryGroupDestroy as TicketLaboratoryGroup | null,
        ticketLaboratoryGroupModified: ticketLaboratoryGroupModified as TicketLaboratoryGroup | null,
        ticketLaboratoryResultDestroyList,
      }
    })

    return transaction
  }
}

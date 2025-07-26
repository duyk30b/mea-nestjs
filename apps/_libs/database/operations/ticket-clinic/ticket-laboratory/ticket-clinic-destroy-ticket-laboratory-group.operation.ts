import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus } from '../../../common/variable'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketLaboratoryGroupManager,
  TicketLaboratoryManager,
  TicketLaboratoryResultManager,
  TicketManager,
} from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketClinicDestroyTicketLaboratoryGroupOperation {
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
      const ticketLaboratoryGroupDestroy =
        await this.ticketLaboratoryGroupManager.deleteOneAndReturnEntity(manager, {
          oid,
          ticketId,
          id: ticketLaboratoryGroupId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        })

      const ticketLaboratoryDestroyList = await this.ticketLaboratoryManager.deleteAndReturnEntity(
        manager,
        {
          oid,
          ticketId,
          ticketLaboratoryGroupId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        }
      )

      const ticketLaboratoryResultDestroyList =
        await this.ticketLaboratoryResultManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          ticketLaboratoryGroupId,
        })

      // === 4. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyDelete = ticketLaboratoryDestroyList.reduce(
        (acc, item) => acc + item.actualPrice,
        0
      )
      const itemsDiscountDelete = ticketLaboratoryDestroyList.reduce(
        (acc, item) => acc + item.discountMoney,
        0
      )
      const itemsCostAmountDelete = ticketLaboratoryDestroyList.reduce(
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
        ticketLaboratoryDestroyList,
        ticketLaboratoryGroupDestroy,
        ticketLaboratoryResultDestroyList,
      }
    })

    return transaction
  }
}

import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DiscountType } from '../../common/variable'
import { TicketStatus } from '../../entities/ticket.entity'
import { TicketManager } from '../../repositories'

@Injectable()
export class TicketChangeDiscountOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager
  ) { }

  async changeDiscount(params: {
    oid: number
    ticketId: string
    discountType: DiscountType
    discountMoney: number
    discountPercent: number
  }) {
    const { oid, ticketId, discountType, discountMoney, discountPercent } = params
    const PREFIX = `ticketId=${ticketId} pay debt failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: { IN: [TicketStatus.Draft, TicketStatus.Deposited, TicketStatus.Executing] },
        },
        { updatedAt: Date.now() }
      )

      const totalMoneyUpdate = ticketOrigin.itemsActualMoney - discountMoney
      const debtUpdate = totalMoneyUpdate - ticketOrigin.paid
      const profitUpdate =
        totalMoneyUpdate
        - ticketOrigin.itemsCostAmount
        - ticketOrigin.expense
        - ticketOrigin.commissionMoney

      // === 2. UPDATE TICKET ===
      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          discountType,
          discountMoney,
          discountPercent,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
          profit: profitUpdate,
        }
      )

      return { ticketModified }
    })
  }
}

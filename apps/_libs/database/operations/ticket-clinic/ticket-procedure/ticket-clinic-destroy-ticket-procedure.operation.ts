import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DiscountType } from '../../../common/variable'
import { InteractType } from '../../../entities/commission.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager, TicketUserManager } from '../../../managers'

@Injectable()
export class TicketClinicDestroyTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketUserManager: TicketUserManager
  ) { }

  async destroyTicketProcedure(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
  }) {
    const { oid, ticketId, ticketProcedureId } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET PROCEDURE ===
      const ticketProcedureDestroy = await this.ticketProcedureManager.deleteOneAndReturnEntity(
        manager,
        { oid, id: ticketProcedureId }
      )

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        interactType: InteractType.Procedure,
        ticketItemId: ticketProcedureDestroy.id,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const commissionMoneyDelete = ticketUserDestroyList.reduce((acc, item) => {
        return acc + item.commissionMoney
      }, 0)
      const procedureMoneyDelete =
        ticketProcedureDestroy.quantity * ticketProcedureDestroy.actualPrice

      const procedureMoneyUpdate = ticketOrigin.procedureMoney - procedureMoneyDelete
      const commissionMoneyUpdate = ticketOrigin.commissionMoney - commissionMoneyDelete

      const itemsActualMoneyUpdate =
        ticketOrigin.itemsActualMoney - ticketOrigin.procedureMoney + procedureMoneyUpdate

      const discountType = ticketOrigin.discountType
      let discountPercent = ticketOrigin.discountPercent
      let discountMoney = ticketOrigin.discountMoney
      if (discountType === DiscountType.VND) {
        discountPercent =
          itemsActualMoneyUpdate == 0
            ? 0
            : Math.floor((discountMoney * 100) / itemsActualMoneyUpdate)
      }
      if (discountType === DiscountType.Percent) {
        discountMoney = Math.floor((discountPercent * itemsActualMoneyUpdate) / 100)
      }
      const totalMoneyUpdate = itemsActualMoneyUpdate - discountMoney
      const debtUpdate = totalMoneyUpdate - ticketOrigin.paid
      const profitUpdate =
        totalMoneyUpdate
        - ticketOrigin.totalCostAmount
        - ticketOrigin.expense
        - commissionMoneyUpdate

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          procedureMoney: procedureMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          discountPercent,
          discountMoney,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
          commissionMoney: commissionMoneyUpdate,
          profit: profitUpdate,
        }
      )
      return { ticket, ticketProcedureDestroy, ticketUserDestroyList }
    })

    return transaction
  }
}

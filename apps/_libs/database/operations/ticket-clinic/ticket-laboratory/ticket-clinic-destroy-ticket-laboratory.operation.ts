import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketLaboratoryManager, TicketManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketClinicDestroyTicketLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketLaboratory(params: {
    oid: number
    ticketId: number
    ticketLaboratoryId: number
  }) {
    const { oid, ticketId, ticketLaboratoryId } = params
    const PREFIX = `ticketId=${ticketId} addTicketLaboratory failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET PROCEDURE ===
      const ticketLaboratoryDestroy = await this.ticketLaboratoryManager.deleteOneAndReturnEntity(
        manager,
        { oid, id: ticketLaboratoryId }
      )

      // === 4. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyDelete = ticketLaboratoryDestroy.actualPrice

      let ticket: Ticket = ticketOrigin
      if (laboratoryMoneyDelete != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            laboratoryMoneyAdd: -laboratoryMoneyDelete,
          },
        })
      }

      return { ticket, ticketLaboratoryDestroy }
    })

    return transaction
  }
}

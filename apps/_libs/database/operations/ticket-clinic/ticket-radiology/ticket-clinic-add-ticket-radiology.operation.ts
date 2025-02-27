import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { TicketRadiologyInsertType } from '../../../entities/ticket-radiology.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketClinicAddTicketRadiologyOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketRadiology<T extends TicketRadiologyInsertType>(params: {
    oid: number
    ticketId: number
    ticketRadiologyInsertDto: NoExtra<TicketRadiologyInsertType, T>
  }) {
    const { oid, ticketId, ticketRadiologyInsertDto } = params
    const PREFIX = `ticketId=${ticketId} addTicketRadiology failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketRadiology = await this.ticketRadiologyManager.insertOneAndReturnEntity(
        manager,
        ticketRadiologyInsertDto
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const radiologyMoneyAdd = ticketRadiology.actualPrice
      const itemsCostAmountAdd = ticketRadiology.costPrice
      const itemsDiscountAdd = ticketRadiology.discountMoney
      let ticket: Ticket = ticketOrigin
      if (radiologyMoneyAdd != 0 || itemsDiscountAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            radiologyMoneyAdd,
            itemsDiscountAdd,
            itemsCostAmountAdd,
          },
        })
      }
      return { ticket, ticketRadiology }
    })

    return transaction
  }
}

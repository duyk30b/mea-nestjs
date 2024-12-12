import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DiscountType } from '../../common/variable'
import {
  TicketLaboratoryInsertBasicType,
  TicketLaboratoryInsertType,
} from '../../entities/ticket-laboratory.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { TicketLaboratoryManager, TicketManager } from '../../managers'

@Injectable()
export class TicketClinicUpdateTicketLaboratoryListOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager
  ) { }

  async updateTicketLaboratoryList(params: {
    oid: number
    ticketId: number
    ticketLaboratoryListDto: TicketLaboratoryInsertBasicType[]
  }) {
    const { oid, ticketId, ticketLaboratoryListDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketLaboratoryList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: TicketStatus.Executing,
        },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE OLD ===
      await this.ticketLaboratoryManager.delete(manager, {
        oid,
        ticketId,
        startedAt: { IS_NULL: true }, // chỉ xóa những thằng chưa thực hiện
      })

      // === 3. INSERT NEW ===
      if (ticketLaboratoryListDto.length) {
        const ticketLaboratoryListInsert = ticketLaboratoryListDto.map((i) => {
          const draft: TicketLaboratoryInsertType = {
            ...i,
            oid,
            ticketId,
            customerId: ticketOrigin.customerId,
            startedAt: null,
            result: JSON.stringify({}),
            attention: JSON.stringify({}),
          }
          return draft
        })
        await this.ticketLaboratoryManager.insertMany(manager, ticketLaboratoryListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketLaboratoryList = await this.ticketLaboratoryManager.findMany(manager, {
        condition: { ticketId },
        sort: { id: 'ASC' },
      })

      // === 5. UPDATE VISIT: MONEY  ===
      const laboratoryMoneyUpdate = ticketLaboratoryList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)

      const itemsActualMoneyUpdate =
        ticketOrigin.itemsActualMoney - ticketOrigin.laboratoryMoney + laboratoryMoneyUpdate

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

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          laboratoryMoney: laboratoryMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          discountPercent,
          discountMoney,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
        }
      )

      return { ticket, ticketLaboratoryList }
    })

    return transaction
  }
}

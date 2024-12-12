import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DiscountType } from '../../common/variable'
import { TicketRadiology } from '../../entities'
import {
  TicketRadiologyInsertBasicType,
  TicketRadiologyInsertType,
} from '../../entities/ticket-radiology.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager } from '../../managers'

@Injectable()
export class TicketClinicUpdateTicketRadiologyListOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager
  ) { }

  async updateTicketRadiologyList(params: {
    oid: number
    ticketId: number
    ticketRadiologyListDto: TicketRadiologyInsertBasicType[]
  }) {
    const { oid, ticketId, ticketRadiologyListDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketRadiologyList failed`

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
      await this.ticketRadiologyManager.delete(manager, {
        oid,
        ticketId,
        startedAt: { IS_NULL: true }, // chỉ xóa những thằng chưa thực hiện
      })

      // === 3. INSERT NEW ===
      if (ticketRadiologyListDto.length) {
        const ticketRadiologyListInsert = ticketRadiologyListDto.map((i) => {
          const draft: TicketRadiologyInsertType = {
            ...i,
            oid,
            ticketId,
            customerId: ticketOrigin.customerId,
            startedAt: null,
            description: '',
            result: '',
            imageIds: JSON.stringify([]),
          }
          return draft
        })
        await this.ticketRadiologyManager.insertMany(manager, ticketRadiologyListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketRadiologyList = await this.ticketRadiologyManager.findMany(manager, {
        relation: { radiology: {} },
        relationLoadStrategy: 'join',
        condition: { ticketId },
        sort: { id: 'ASC' },
      })

      // === 5. UPDATE TICKET: MONEY  ===
      const radiologyMoneyUpdate = ticketRadiologyList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)
      const itemsActualMoneyUpdate =
        ticketOrigin.itemsActualMoney - ticketOrigin.radiologyMoney + radiologyMoneyUpdate

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
          radiologyMoney: radiologyMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          discountPercent,
          discountMoney,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
        }
      )

      return { ticket, ticketRadiologyList }
    })

    return transaction
  }
}

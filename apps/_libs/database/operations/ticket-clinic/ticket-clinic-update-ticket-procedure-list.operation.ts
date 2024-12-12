import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { DiscountType } from '../../common/variable'
import TicketProcedure, {
  TicketProcedureInsertType,
  TicketProcedureRelationType,
  TicketProcedureStatus,
} from '../../entities/ticket-procedure.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager } from '../../managers'

export type TicketClinicProcedureUpdateDtoType = Omit<
  TicketProcedure,
  | keyof TicketProcedureRelationType
  | keyof Pick<
    TicketProcedure,
    'oid' | 'id' | 'ticketId' | 'customerId' | 'result' | 'startedAt' | 'status' | 'imageIds'
  >
>

@Injectable()
export class TicketClinicUpdateTicketProcedureListOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager
  ) { }

  async updateTicketProcedureList<T extends TicketClinicProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureListDto: NoExtra<TicketClinicProcedureUpdateDtoType, T>[]
  }) {
    const { oid, ticketId, ticketProcedureListDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProcedureList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
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
      await this.ticketProcedureManager.delete(manager, { oid, ticketId })

      // === 3. INSERT NEW ===
      if (ticketProcedureListDto.length) {
        const ticketProcedureListInsert = ticketProcedureListDto.map((i) => {
          const draft: NoExtra<TicketProcedureInsertType> = {
            ...i,
            oid,
            ticketId,
            customerId: ticketOrigin.customerId,
            imageIds: JSON.stringify([]),
            result: '',
            startedAt: null,
            status: TicketProcedureStatus.Completed, // coi như đã hoàn thành
          }
          return draft
        })
        await this.ticketProcedureManager.insertMany(manager, ticketProcedureListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketProcedureList = await this.ticketProcedureManager.findMany(manager, {
        relation: { procedure: true },
        relationLoadStrategy: 'join',
        condition: { ticketId },
        sort: { id: 'ASC' },
      })

      const procedureMoneyUpdate = ticketProcedureList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)

      // === 5. UPDATE TICKET: MONEY  ===
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
        }
      )
      return { ticket, ticketProcedureList }
    })

    return transaction
  }
}

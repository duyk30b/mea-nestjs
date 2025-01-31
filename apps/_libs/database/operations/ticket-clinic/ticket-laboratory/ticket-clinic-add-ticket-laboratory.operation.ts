import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import TicketLaboratory, {
  TicketLaboratoryInsertType,
  TicketLaboratoryRelationType,
  TicketLaboratoryStatus,
} from '../../../entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketLaboratoryManager, TicketManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketLaboratoryInsertBasicType = Omit<
  TicketLaboratory,
  | keyof TicketLaboratoryRelationType
  | keyof Pick<
    TicketLaboratory,
    'oid' | 'id' | 'ticketId' | 'customerId' | 'startedAt' | 'status' | 'result' | 'attention'
  >
>

@Injectable()
export class TicketClinicAddTicketLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketLaboratoryList<T extends TicketLaboratoryInsertBasicType>(params: {
    oid: number
    ticketId: number
    ticketLaboratoryDtoList: NoExtra<TicketLaboratoryInsertBasicType, T>[]
  }) {
    const { oid, ticketId, ticketLaboratoryDtoList } = params
    const PREFIX = `ticketId=${ticketId} addTicketLaboratory failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketLaboratoryInsertList = ticketLaboratoryDtoList.map((i) => {
        const insert: NoExtra<TicketLaboratoryInsertType> = {
          ...i,
          oid,
          ticketId,
          customerId: ticketOrigin.customerId,
          status: TicketLaboratoryStatus.Pending,
          startedAt: null,
          result: JSON.stringify({}),
          attention: JSON.stringify({}),
        }
        return insert
      })
      const ticketLaboratoryList = await this.ticketLaboratoryManager.insertManyAndReturnEntity(
        manager,
        ticketLaboratoryInsertList
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const laboratoryMoneyAdd = ticketLaboratoryList.reduce((acc, cur) => {
        return acc + cur.actualPrice
      }, 0)
      let ticket: Ticket = ticketOrigin
      if (laboratoryMoneyAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            laboratoryMoneyAdd,
          },
        })
      }
      return { ticket, ticketLaboratoryList }
    })

    return transaction
  }
}

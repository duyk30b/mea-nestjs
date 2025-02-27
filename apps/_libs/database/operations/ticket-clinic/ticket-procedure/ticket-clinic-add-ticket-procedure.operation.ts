import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { InteractType } from '../../../entities/commission.entity'
import TicketProcedure, {
  TicketProcedureInsertType,
  TicketProcedureRelationType,
  TicketProcedureStatus,
} from '../../../entities/ticket-procedure.entity'
import TicketUser from '../../../entities/ticket-user.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from '../../ticket-user/ticket-user-change-list.manager'

export type TicketProcedureAddDtoType = Omit<
  TicketProcedure,
  | keyof TicketProcedureRelationType
  | keyof Pick<
    TicketProcedure,
    'oid' | 'id' | 'ticketId' | 'customerId' | 'result' | 'startedAt' | 'status' | 'imageIds'
  >
>

@Injectable()
export class TicketClinicAddTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketProcedure<T extends TicketProcedureAddDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureDto: NoExtra<TicketProcedureAddDtoType, T>
    ticketUserDto: { roleId: number; userId: number }[]
  }) {
    const { oid, ticketId, ticketProcedureDto, ticketUserDto } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketProcedureInsert: NoExtra<TicketProcedureInsertType> = {
        ...ticketProcedureDto,
        oid,
        ticketId,
        customerId: ticketOrigin.customerId,
        imageIds: JSON.stringify([]),
        result: '',
        startedAt: null,
        status: TicketProcedureStatus.Completed, // coi như đã hoàn thành
      }
      const ticketProcedure = await this.ticketProcedureManager.insertOneAndReturnEntity(
        manager,
        ticketProcedureInsert
      )

      let commissionMoneyAdd = 0
      let ticketUserInsertList: TicketUser[] = []
      if (ticketUserDto.length) {
        ticketUserInsertList = await this.ticketUserChangeListManager.insertList({
          manager,
          information: {
            oid,
            ticketId,
            interactType: InteractType.Procedure,
            interactId: ticketProcedure.procedureId,
            ticketItemId: ticketProcedure.id,
            quantity: ticketProcedure.quantity,
            ticketItemActualPrice: ticketProcedure.actualPrice,
            ticketItemExpectedPrice: ticketProcedure.expectedPrice,
          },
          dataInsert: ticketUserDto,
        })

        commissionMoneyAdd = ticketUserInsertList.reduce((acc, item) => {
          return acc + item.commissionMoney * item.quantity
        }, 0)
      }

      // === 5. UPDATE TICKET: MONEY  ===
      const procedureMoneyAdd = ticketProcedure.quantity * ticketProcedure.actualPrice
      const itemsDiscountAdd = ticketProcedure.quantity * ticketProcedure.discountMoney
      let ticket: Ticket = ticketOrigin
      if (procedureMoneyAdd != 0 || itemsDiscountAdd !== 0 || commissionMoneyAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd,
            commissionMoneyAdd,
            itemsDiscountAdd,
          },
        })
      }
      return { ticket, ticketProcedure, ticketUserInsertList }
    })

    return transaction
  }
}

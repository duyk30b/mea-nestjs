import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InteractType } from '../../../entities/commission.entity'
import TicketRadiology, { TicketRadiologyStatus } from '../../../entities/ticket-radiology.entity'
import TicketUser from '../../../entities/ticket-user.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from '../../ticket-user/ticket-user-change-list.manager'

@Injectable()
export class TicketClinicUpdateTicketRadiologyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketRadiology(params: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
    ticketRadiologyUpdateDto?: {
      description: string
      result: string
      startedAt: number
      imageIds: string
    }
    ticketUserDto?: { roleId: number; userId: number }[]
  }) {
    const { oid, ticketId, ticketRadiologyId, ticketRadiologyUpdateDto, ticketUserDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketRadiology failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketRadiologyOrigin = await this.ticketRadiologyManager.findOneBy(manager, {
        oid,
        id: ticketRadiologyId,
      })

      let ticketRadiology: TicketRadiology = ticketRadiologyOrigin
      if (ticketRadiologyUpdateDto) {
        ticketRadiology = await this.ticketRadiologyManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketRadiologyId },
          {
            description: ticketRadiologyUpdateDto.description,
            result: ticketRadiologyUpdateDto.result,
            startedAt: ticketRadiologyUpdateDto.startedAt,
            imageIds: ticketRadiologyUpdateDto.imageIds,
            status: TicketRadiologyStatus.Completed,
          }
        )
      }

      const radiologyMoneyChange = ticketRadiology.actualPrice - ticketRadiologyOrigin.actualPrice
      let commissionMoneyChange = 0
      let ticketUserChangeList: {
        ticketUserDestroyList: TicketUser[]
        ticketUserUpdateList: TicketUser[]
        ticketUserInsertList: TicketUser[]
      }
      if (ticketUserDto) {
        ticketUserChangeList = await this.ticketUserChangeListManager.changeList({
          manager,
          information: {
            oid,
            ticketId,
            interactType: InteractType.Radiology,
            interactId: ticketRadiologyOrigin.radiologyId,
            ticketItemId: ticketRadiologyOrigin.id,
            ticketItemActualPrice: ticketRadiology.actualPrice,
            ticketItemExpectedPrice: ticketRadiology.expectedPrice,
          },
          dataChange: ticketUserDto,
        })
        const commissionMoneyDelete = ticketUserChangeList.ticketUserDestroyList.reduce(
          (acc, item) => {
            return acc + item.commissionMoney
          },
          0
        )
        const commissionMoneyAdd = ticketUserChangeList.ticketUserInsertList.reduce((acc, item) => {
          return acc + item.commissionMoney
        }, 0)

        commissionMoneyChange = commissionMoneyAdd - commissionMoneyDelete
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (radiologyMoneyChange != 0 || commissionMoneyChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            radiologyMoneyAdd: radiologyMoneyChange,
            commissionMoneyAdd: commissionMoneyChange,
          },
        })
      }
      return { ticket, ticketRadiology, ticketUserChangeList }
    })

    return transaction
  }
}

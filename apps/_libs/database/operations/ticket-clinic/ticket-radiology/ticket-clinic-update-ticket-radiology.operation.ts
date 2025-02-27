import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { InteractType } from '../../../entities/commission.entity'
import TicketRadiology, { TicketRadiologyStatus } from '../../../entities/ticket-radiology.entity'
import TicketUser from '../../../entities/ticket-user.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from '../../ticket-user/ticket-user-change-list.manager'

export type TicketRadiologyUpdateDtoType = {
  [K in keyof Pick<
    TicketRadiology,
    | 'description'
    | 'result'
    | 'startedAt'
    | 'imageIds'
    | 'expectedPrice'
    | 'discountType'
    | 'discountMoney'
    | 'discountPercent'
    | 'actualPrice'
  >]?: TicketRadiology[K] | (() => string)
}

@Injectable()
export class TicketClinicUpdateTicketRadiologyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketRadiology<T extends TicketRadiologyUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketRadiologyId: number
    ticketRadiologyUpdateDto?: NoExtra<TicketRadiologyUpdateDtoType, T>
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
            expectedPrice: ticketRadiologyUpdateDto.expectedPrice,
            discountType: ticketRadiologyUpdateDto.discountType,
            discountMoney: ticketRadiologyUpdateDto.discountMoney,
            discountPercent: ticketRadiologyUpdateDto.discountPercent,
            actualPrice: ticketRadiologyUpdateDto.actualPrice,
          }
        )
      }

      const radiologyMoneyChange = ticketRadiology.actualPrice - ticketRadiologyOrigin.actualPrice
      const itemsDiscountChange =
        ticketRadiology.discountMoney - ticketRadiologyOrigin.discountMoney
      const itemsCostAmountChange = ticketRadiology.costPrice - ticketRadiologyOrigin.costPrice
      let commissionMoneyChange = 0
      let ticketUserChangeList: {
        ticketUserDestroyList: TicketUser[]
        ticketUserInsertList: TicketUser[]
      }
      if (ticketUserDto) {
        ticketUserChangeList = await this.ticketUserChangeListManager.replaceList({
          manager,
          information: {
            oid,
            ticketId,
            interactType: InteractType.Radiology,
            interactId: ticketRadiology.radiologyId,
            ticketItemId: ticketRadiology.id,
            quantity: 1,
            ticketItemActualPrice: ticketRadiology.actualPrice,
            ticketItemExpectedPrice: ticketRadiology.expectedPrice,
          },
          dataChange: ticketUserDto,
        })
        const commissionMoneyDelete = ticketUserChangeList.ticketUserDestroyList.reduce(
          (acc, item) => {
            return acc + item.commissionMoney * item.quantity
          },
          0
        )
        const commissionMoneyAdd = ticketUserChangeList.ticketUserInsertList.reduce((acc, item) => {
          return acc + item.commissionMoney * item.quantity
        }, 0)

        commissionMoneyChange = commissionMoneyAdd - commissionMoneyDelete
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticket: Ticket = ticketOrigin
      if (radiologyMoneyChange != 0 || itemsDiscountChange != 0 || commissionMoneyChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            radiologyMoneyAdd: radiologyMoneyChange,
            commissionMoneyAdd: commissionMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
            itemsCostAmountAdd: itemsCostAmountChange,
          },
        })
      }
      return { ticket, ticketRadiology, ticketUserChangeList }
    })

    return transaction
  }
}

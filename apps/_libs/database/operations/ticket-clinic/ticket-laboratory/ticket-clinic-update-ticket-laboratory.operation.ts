import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { InteractType } from '../../../entities/commission.entity'
import TicketLaboratory from '../../../entities/ticket-laboratory.entity'
import TicketUser from '../../../entities/ticket-user.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketLaboratoryManager, TicketManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserChangeListManager } from '../../ticket-user/ticket-user-change-list.manager'

export type TicketLaboratoryUpdateDtoType = {
  [K in keyof Pick<
    TicketLaboratory,
    'expectedPrice' | 'discountType' | 'discountMoney' | 'discountPercent' | 'actualPrice'
  >]: TicketLaboratory[K] | (() => string)
}

@Injectable()
export class TicketClinicUpdateTicketLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketUserChangeListManager: TicketUserChangeListManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketLaboratory<T extends TicketLaboratoryUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketLaboratoryId: number
    ticketLaboratoryUpdateDto?: NoExtra<TicketLaboratoryUpdateDtoType, T>
    ticketUserDto?: { roleId: number; userId: number }[]
  }) {
    const { oid, ticketId, ticketLaboratoryId, ticketLaboratoryUpdateDto, ticketUserDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketLaboratory failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketLaboratoryOrigin = await this.ticketLaboratoryManager.findOneBy(manager, {
        oid,
        id: ticketLaboratoryId,
      })

      let ticketLaboratory: TicketLaboratory = ticketLaboratoryOrigin
      let laboratoryMoneyChange = 0
      let itemsDiscountChange = 0
      let itemsCostAmountChange = 0
      if (ticketLaboratoryUpdateDto) {
        ticketLaboratory = await this.ticketLaboratoryManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketLaboratoryId },
          {
            expectedPrice: ticketLaboratoryUpdateDto.expectedPrice,
            discountType: ticketLaboratoryUpdateDto.discountType,
            discountMoney: ticketLaboratoryUpdateDto.discountMoney,
            discountPercent: ticketLaboratoryUpdateDto.discountPercent,
            actualPrice: ticketLaboratoryUpdateDto.actualPrice,
          }
        )
        laboratoryMoneyChange = ticketLaboratory.actualPrice - ticketLaboratoryOrigin.actualPrice
        itemsDiscountChange = ticketLaboratory.discountMoney - ticketLaboratoryOrigin.discountMoney
        itemsCostAmountChange = ticketLaboratory.costPrice - ticketLaboratoryOrigin.costPrice
      }

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
            interactType: InteractType.Laboratory,
            interactId: ticketLaboratory.laboratoryId,
            ticketItemId: ticketLaboratory.id,
            quantity: 1,
            ticketItemActualPrice: ticketLaboratory.actualPrice,
            ticketItemExpectedPrice: ticketLaboratory.expectedPrice,
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
      if (laboratoryMoneyChange != 0 || itemsDiscountChange != 0 || commissionMoneyChange != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            laboratoryMoneyAdd: laboratoryMoneyChange,
            commissionMoneyAdd: commissionMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
            itemsCostAmountAdd: itemsCostAmountChange,
          },
        })
      }
      return { ticket, ticketLaboratory, ticketUserChangeList }
    })

    return transaction
  }
}

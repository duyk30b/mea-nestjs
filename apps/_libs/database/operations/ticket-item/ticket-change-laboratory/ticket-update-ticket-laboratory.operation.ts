import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { BusinessError } from '../../../common/error'
import { PaymentMoneyStatus } from '../../../common/variable'
import { TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import TicketLaboratory from '../../../entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketLaboratoryManager, TicketManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketLaboratoryUpdateDtoType = {
  [K in keyof Pick<
    TicketLaboratory,
    'expectedPrice' | 'discountType' | 'discountMoney' | 'discountPercent' | 'actualPrice'
  >]: TicketLaboratory[K] | (() => string)
}

@Injectable()
export class TicketUpdateTicketLaboratoryOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateTicketLaboratory<T extends TicketLaboratoryUpdateDtoType>(params: {
    oid: number
    ticketId: string
    ticketLaboratoryId: string
    ticketLaboratoryUpdateDto?: NoExtra<TicketLaboratoryUpdateDtoType, T>
    ticketUserRequestList?: Pick<TicketUser, 'positionId' | 'userId'>[]
  }) {
    const { oid, ticketId, ticketLaboratoryId, ticketLaboratoryUpdateDto, ticketUserRequestList } =
      params
    const PREFIX = `ticketId=${ticketId} updateTicketLaboratory failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketLaboratoryOrigin = await this.ticketLaboratoryManager.findOneBy(manager, {
        oid,
        id: ticketLaboratoryId,
      })

      if (ticketLaboratoryOrigin.paymentMoneyStatus === PaymentMoneyStatus.Paid) {
        throw new BusinessError('Xét nghiệm đã thanh toán không thể sửa')
      }

      let ticketLaboratoryModified: TicketLaboratory = ticketLaboratoryOrigin
      let laboratoryMoneyAdd = 0
      let itemsDiscountAdd = 0
      let itemsCostAmountAdd = 0
      if (ticketLaboratoryUpdateDto) {
        ticketLaboratoryModified = await this.ticketLaboratoryManager.updateOneAndReturnEntity(
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
        laboratoryMoneyAdd =
          ticketLaboratoryModified.actualPrice - ticketLaboratoryOrigin.actualPrice
        itemsDiscountAdd =
          ticketLaboratoryModified.discountMoney - ticketLaboratoryOrigin.discountMoney
        itemsCostAmountAdd =
          ticketLaboratoryModified.costPrice - ticketLaboratoryOrigin.costPrice
      }

      let ticketUserDestroyedList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyAdd = 0
      if (ticketUserRequestList) {
        ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          positionType: PositionType.LaboratoryRequest,
          ticketItemId: ticketLaboratoryModified.id,
        })
        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketLaboratoryModified.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserRequestList.map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              quantity: 1,
              ticketItemId: ticketLaboratoryModified.id,
              positionInteractId: ticketLaboratoryModified.laboratoryId,
              ticketItemExpectedPrice: ticketLaboratoryModified.expectedPrice,
              ticketItemActualPrice: ticketLaboratoryModified.actualPrice,
            }
          }),
        })

        commissionMoneyAdd =
          ticketUserCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserDestroyedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
      }

      // === 5. UPDATE TICKET: MONEY  ===
      let ticketModified: Ticket = ticketOrigin
      if (
        laboratoryMoneyAdd != 0
        || itemsDiscountAdd != 0
        || itemsCostAmountAdd != 0
        || commissionMoneyAdd != 0
      ) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            laboratoryMoneyAdd,
            itemsDiscountAdd,
            itemsCostAmountAdd,
            commissionMoneyAdd,
          },
        })
      }
      return { ticketModified, ticketLaboratoryModified, ticketUserDestroyedList, ticketUserCreatedList }
    })

    return transaction
  }
}

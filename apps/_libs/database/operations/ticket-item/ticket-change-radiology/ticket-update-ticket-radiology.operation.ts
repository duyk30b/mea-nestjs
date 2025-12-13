import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { PaymentMoneyStatus } from '../../../common/variable'
import { TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import TicketRadiology from '../../../entities/ticket-radiology.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketRadiologyUpdateDtoType = {
  [K in keyof Pick<
    TicketRadiology,
    'expectedPrice' | 'discountType' | 'discountMoney' | 'discountPercent' | 'actualPrice'
  >]?: TicketRadiology[K] | (() => string)
}

@Injectable()
export class TicketUpdateTicketRadiologyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateTicketRadiology<T extends TicketRadiologyUpdateDtoType>(params: {
    oid: number
    ticketId: string
    ticketRadiologyId: string
    ticketRadiologyUpdateDto: NoExtra<TicketRadiologyUpdateDtoType, T>
    ticketUserRequestList?: Pick<TicketUser, 'positionId' | 'userId'>[]
  }) {
    const { oid, ticketId, ticketRadiologyId, ticketRadiologyUpdateDto, ticketUserRequestList } =
      params

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketRadiologyOrigin = await this.ticketRadiologyManager.findOneBy(manager, {
        oid,
        id: ticketRadiologyId,
      })

      let ticketRadiologyModified: TicketRadiology = ticketRadiologyOrigin
      if (ticketRadiologyUpdateDto) {
        if (
          [
            PaymentMoneyStatus.TicketPaid,
            PaymentMoneyStatus.PendingPayment,
            PaymentMoneyStatus.NoEffect,
          ].includes(ticketRadiologyOrigin.paymentMoneyStatus)
        ) {
          ticketRadiologyModified = await this.ticketRadiologyManager.updateOneAndReturnEntity(
            manager,
            { oid, id: ticketRadiologyId },
            {
              expectedPrice: ticketRadiologyUpdateDto.expectedPrice,
              discountType: ticketRadiologyUpdateDto.discountType,
              discountMoney: ticketRadiologyUpdateDto.discountMoney,
              discountPercent: ticketRadiologyUpdateDto.discountPercent,
              actualPrice: ticketRadiologyUpdateDto.actualPrice,
              paymentMoneyStatus: (() => {
                if (ticketRadiologyUpdateDto.actualPrice === 0) {
                  return PaymentMoneyStatus.NoEffect
                }
                if (ticketOrigin.isPaymentEachItem) {
                  return PaymentMoneyStatus.PendingPayment
                } else {
                  return PaymentMoneyStatus.TicketPaid
                }
              })(),
            }
          )
        }
      }

      let ticketUserDestroyedList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyAdd = 0
      if (ticketUserRequestList) {
        ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          positionType: PositionType.RadiologyRequest,
          ticketItemId: ticketRadiologyModified.id,
        })
        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketRadiologyModified.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserRequestList.map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              quantity: 1,
              ticketItemId: ticketRadiologyModified.id,
              positionInteractId: ticketRadiologyModified.radiologyId,
              ticketItemExpectedPrice: ticketRadiologyModified.expectedPrice,
              ticketItemActualPrice: ticketRadiologyModified.actualPrice,
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

      const radiologyMoneyAdd =
        ticketRadiologyModified.actualPrice - ticketRadiologyOrigin.actualPrice
      const itemsDiscountAdd =
        ticketRadiologyModified.discountMoney - ticketRadiologyOrigin.discountMoney
      const itemsCostAmountAdd = ticketRadiologyModified.costPrice - ticketRadiologyOrigin.costPrice

      // === 5. UPDATE TICKET: MONEY  ===
      let ticketModified: Ticket = ticketOrigin
      if (
        radiologyMoneyAdd != 0
        || itemsDiscountAdd != 0
        || itemsCostAmountAdd != 0
        || commissionMoneyAdd != 0
      ) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            radiologyMoneyAdd,
            itemsDiscountAdd,
            itemsCostAmountAdd,
            commissionMoneyAdd,
          },
        })
      }
      return {
        ticketModified,
        ticketRadiologyModified,
        ticketUserCreatedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}

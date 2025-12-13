import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus } from '../../../../../../_libs/database/common/variable'
import {
  TicketRadiologyInsertType,
  TicketRadiologyStatus,
} from '../../../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../../../../../../_libs/database/operations/ticket-item/ticket-change-user/ticket-user.common'
import {
  TicketManager,
  TicketRadiologyManager,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketAddTicketRadiologyListBody } from '../request'

@Injectable()
export class TicketAddTicketRadiologyListService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async addTicketRadiologyList(props: {
    oid: number
    ticketId: string
    body: TicketAddTicketRadiologyListBody
  }) {
    const { oid, ticketId, body } = props

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )
      const { customerId } = ticketOrigin

      // === 2. INSERT NEW ===
      const ticketRadiologyInsertList = body.ticketRadiologyWrapList.map((i) => {
        const insert: TicketRadiologyInsertType = {
          ...i.ticketRadiology,
          oid,
          ticketId,
          status: TicketRadiologyStatus.Pending,
          customerId,
          completedAt: null,
          imageIds: '[]',
          paymentMoneyStatus: (() => {
            if (i.ticketRadiology.actualPrice === 0) {
              return PaymentMoneyStatus.NoEffect
            }
            if (ticketOrigin.isPaymentEachItem) {
              return PaymentMoneyStatus.PendingPayment
            } else {
              return PaymentMoneyStatus.TicketPaid
            }
          })(),
          paid: 0,
          debt: 0,
        }
        return insert
      })
      const ticketRadiologyCreatedList =
        await this.ticketRadiologyManager.insertManyAndReturnEntity(
          manager,
          ticketRadiologyInsertList
        )

      const ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
        manager,
        oid,
        ticketId,
        createdAt: Date.now(),
        ticketUserDtoList: body.ticketRadiologyWrapList
          .map((i, index) => {
            return i.ticketUserRequestList.map((j) => {
              const ticketRadiologyCreated = ticketRadiologyCreatedList[index]
              return {
                ...j,
                quantity: 1,
                ticketItemId: ticketRadiologyCreated.id,
                positionInteractId: ticketRadiologyCreated.radiologyId,
                ticketItemExpectedPrice: ticketRadiologyCreated.expectedPrice,
                ticketItemActualPrice: ticketRadiologyCreated.actualPrice,
              }
            })
          })
          .flat()
          .filter((i) => !!i.userId),
      })

      // === 5. UPDATE TICKET: MONEY  ===
      const radiologyMoneyAdd = ticketRadiologyCreatedList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)
      const itemsCostAmountAdd = ticketRadiologyCreatedList.reduce((acc, item) => {
        return acc + item.costPrice
      }, 0)
      const itemsDiscountAdd = ticketRadiologyCreatedList.reduce((acc, item) => {
        return acc + item.discountMoney
      }, 0)
      const commissionMoneyAdd = ticketUserCreatedList.reduce((acc, item) => {
        return acc + item.quantity * item.commissionMoney
      }, 0)

      let ticketModified = ticketOrigin
      if (
        radiologyMoneyAdd != 0
        || itemsDiscountAdd != 0
        || itemsCostAmountAdd != 0
        || commissionMoneyAdd != 0
      ) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            radiologyMoneyAdd,
            itemsDiscountAdd,
            itemsCostAmountAdd,
            commissionMoneyAdd,
          },
        })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketRadiology: { upsertedList: ticketRadiologyCreatedList },
        ticketUser: { upsertedList: ticketUserCreatedList },
      })

      return { ticketModified, ticketRadiologyCreatedList, ticketUserCreatedList }
    })

    return transaction
  }
}

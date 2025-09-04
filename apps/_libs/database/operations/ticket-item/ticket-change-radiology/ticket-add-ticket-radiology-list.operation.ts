import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { TicketUser } from '../../../entities'
import TicketRadiology, {
  TicketRadiologyInsertType,
  TicketRadiologyStatus,
} from '../../../entities/ticket-radiology.entity'
import { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketRadiologyAddWrapType = {
  ticketRadiologyAdd: Pick<
    TicketRadiology,
    | 'priority'
    | 'radiologyId'
    | 'printHtmlId'
    | 'customStyles'
    | 'customVariables'
    | 'roomId'
    | 'paymentMoneyStatus'
    | 'costPrice'
    | 'expectedPrice'
    | 'discountMoney'
    | 'discountPercent'
    | 'discountType'
    | 'actualPrice'
    | 'description'
    | 'result'
    | 'createdAt'
  >
  ticketUserRequestAddList: Pick<TicketUser, 'positionId' | 'userId'>[]
}

@Injectable()
export class TicketAddTicketRadiologyListOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async addTicketRadiologyList(params: {
    oid: number
    ticketId: number
    ticketRadiologyAddWrapList: TicketRadiologyAddWrapType[]
  }) {
    const { oid, ticketId, ticketRadiologyAddWrapList } = params
    const PREFIX = `ticketId=${ticketId} addTicketRadiology failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      let ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketRadiologyInsertList = ticketRadiologyAddWrapList.map((i) => {
        const insert: TicketRadiologyInsertType = {
          ...i.ticketRadiologyAdd,
          oid,
          ticketId,
          status: TicketRadiologyStatus.Pending,
          customerId: ticketModified.customerId,
          completedAt: null,
          imageIds: '[]',
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
        ticketUserDtoList: ticketRadiologyAddWrapList
          .map((i, index) => {
            return i.ticketUserRequestAddList.map((j) => {
              const ticketRadiologyCreated = ticketRadiologyCreatedList[index]
              return {
                ...j,
                quantity: 1,
                ticketItemId: ticketRadiologyCreated.id,
                ticketItemChildId: 0,
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
      return { ticketModified, ticketRadiologyCreatedList, ticketUserCreatedList }
    })

    return transaction
  }
}

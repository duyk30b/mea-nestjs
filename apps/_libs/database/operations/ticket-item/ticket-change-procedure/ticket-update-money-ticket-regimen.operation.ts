import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { BusinessError } from '../../../common/error'
import { PaymentMoneyStatus, TicketRegimenStatus } from '../../../common/variable'
import { TicketProcedure, TicketRegimen, TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketManager,
  TicketProcedureManager,
  TicketRegimenManager,
  TicketUserManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

export type TicketRegimenUpdateDtoType = Pick<
  TicketRegimen,
  | 'expectedPrice'
  | 'discountType'
  | 'discountMoney'
  | 'discountPercent'
  | 'actualPrice'
>

export type TicketProcedureUpdateDtoType = Pick<
  TicketProcedure,
  | 'id'
  | 'quantity'
  | 'expectedPrice'
  | 'discountType'
  | 'discountMoney'
  | 'discountPercent'
  | 'actualPrice'
>

@Injectable()
export class TicketUpdateMoneyTicketRegimenOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRegimenManager: TicketRegimenManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateMoneyTicketRegimen<
    T extends TicketRegimenUpdateDtoType,
    U extends TicketProcedureUpdateDtoType,
  >(params: {
    oid: number
    ticketId: number
    ticketRegimenId: number
    ticketRegimenUpdateDto: NoExtra<TicketRegimenUpdateDtoType, T>
    ticketProcedureUpdateList: NoExtra<TicketProcedureUpdateDtoType, U>[]
  }) {
    const { oid, ticketId, ticketRegimenId, ticketRegimenUpdateDto } = params
    const ticketProcedureUpdateList =
      params.ticketProcedureUpdateList as TicketProcedureUpdateDtoType[]
    const PREFIX = `ticketId=${ticketId} updateTicketRegimen failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketRegimenOrigin = await this.ticketRegimenManager.findOneBy(manager, {
        oid,
        ticketId,
        id: ticketRegimenId,
      })

      if (ticketRegimenOrigin.paymentMoneyStatus === PaymentMoneyStatus.Paid) {
        throw new BusinessError('Không thể sửa phiếu đã thanh toán')
      }
      if (ticketRegimenOrigin.status !== TicketRegimenStatus.Pending) {
        throw new BusinessError('Không thể sửa phiếu đã thực hiện')
      }

      const ticketProcedureModifiedList = await this.ticketProcedureManager.bulkUpdate({
        manager,
        condition: { oid, ticketRegimenId }, // không được so sánh có ticketId, vì chúng nó đang = 0
        tempList: ticketProcedureUpdateList,
        compare: ['id'],
        update: [
          'quantity',
          'expectedPrice',
          'discountMoney',
          'discountPercent',
          'discountType',
          'actualPrice',
        ],
        options: { requireEqualLength: true },
      })

      let ticketUserDestroyedList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyChange = 0
      if (ticketRegimenOrigin.commissionAmount) {
        ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          positionType: PositionType.RegimenRequest,
          ticketItemId: ticketRegimenId,
        })
        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketRegimenOrigin.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserDestroyedList.map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              quantity: 1,
              ticketItemId: ticketRegimenOrigin.id,
              ticketItemChildId: 0,
              positionInteractId: ticketRegimenOrigin.regimenId,
              ticketItemExpectedPrice: ticketRegimenUpdateDto.expectedPrice,
              ticketItemActualPrice: ticketRegimenUpdateDto.actualPrice,
            }
          }),
        })

        commissionMoneyChange =
          ticketUserCreatedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserDestroyedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
      }

      // Update ticketRegimen sau vì có thay đổi commission khi update ticketUser
      const ticketRegimenModified = await this.ticketRegimenManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketRegimenId },
        {
          expectedPrice: ticketRegimenUpdateDto.expectedPrice,
          discountType: ticketRegimenUpdateDto.discountType,
          discountMoney: ticketRegimenUpdateDto.discountMoney,
          discountPercent: ticketRegimenUpdateDto.discountPercent,
          actualPrice: ticketRegimenUpdateDto.actualPrice,
          commissionAmount: ticketRegimenOrigin.commissionAmount + commissionMoneyChange,
        }
      )
      ticketRegimenModified.ticketProcedureList = ticketProcedureModifiedList

      const procedureMoneyChange =
        ticketRegimenModified.actualPrice - ticketRegimenOrigin.actualPrice
      const itemsDiscountChange =
        ticketRegimenModified.discountMoney - ticketRegimenOrigin.discountMoney

      // === 5. UPDATE TICKET: MONEY  ===
      let ticketModified: Ticket = ticketOrigin
      if (procedureMoneyChange != 0 || itemsDiscountChange != 0 || commissionMoneyChange != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: procedureMoneyChange,
            itemsDiscountAdd: itemsDiscountChange,
            commissionMoneyAdd: commissionMoneyChange,
          },
        })
      }
      return {
        ticketModified,
        ticketRegimenModified,
        ticketUserCreatedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}

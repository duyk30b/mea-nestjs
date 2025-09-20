import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { BusinessError } from '../../../common/error'
import { PaymentMoneyStatus } from '../../../common/variable'
import { TicketProcedure, TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import { TicketProcedureStatus } from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../ticket-change-user/ticket-user.common'

type TicketProcedureUpdateDtoType = Pick<
  TicketProcedure,
  'expectedPrice' | 'discountType' | 'discountMoney' | 'discountPercent' | 'actualPrice'
>

@Injectable()
export class TicketUpdateMoneyTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateMoneyTicketProcedure<T extends TicketProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
    ticketProcedureUpdateDto: NoExtra<TicketProcedureUpdateDtoType, T>
  }) {
    const { oid, ticketId, ticketProcedureId, ticketProcedureUpdateDto } = params

    const PREFIX = `ticketId=${ticketId} updateTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketProcedureOrigin = await this.ticketProcedureManager.findOneBy(manager, {
        oid,
        ticketId,
        id: ticketProcedureId,
      })

      if (
        ![PaymentMoneyStatus.TicketPaid, PaymentMoneyStatus.PendingPayment].includes(
          ticketProcedureOrigin.paymentMoneyStatus
        )
      ) {
        throw new BusinessError('Không thể sửa phiếu đã thanh toán')
      }

      let ticketUserDestroyedList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyChange = 0
      if (ticketProcedureOrigin.commissionAmount) {
        ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          positionType: { IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult] },
          ticketItemId: ticketProcedureId,
        })
        ticketUserCreatedList = await this.ticketUserCommon.addTicketUserList({
          manager,
          createdAt: ticketProcedureOrigin.createdAt,
          oid,
          ticketId,
          ticketUserDtoList: ticketUserDestroyedList.map((i) => {
            return {
              positionId: i.positionId,
              userId: i.userId,
              quantity: 1,
              ticketItemId: ticketProcedureOrigin.id,
              ticketItemChildId: 0,
              positionInteractId: ticketProcedureOrigin.procedureId,
              ticketItemExpectedPrice: ticketProcedureUpdateDto.expectedPrice,
              ticketItemActualPrice: ticketProcedureUpdateDto.actualPrice,
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

      // Update ticketProcedure sau vì có thay đổi commission khi update ticketUser
      const ticketProcedureModified = await this.ticketProcedureManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketProcedureId },
        {
          expectedPrice: ticketProcedureUpdateDto.expectedPrice,
          discountType: ticketProcedureUpdateDto.discountType,
          discountMoney: ticketProcedureUpdateDto.discountMoney,
          discountPercent: ticketProcedureUpdateDto.discountPercent,
          actualPrice: ticketProcedureUpdateDto.actualPrice,
          commissionAmount: ticketProcedureOrigin.commissionAmount + commissionMoneyChange,
        }
      )
      const procedureMoneyChange =
        ticketProcedureModified.actualPrice - ticketProcedureOrigin.actualPrice
      const itemsDiscountChange =
        ticketProcedureModified.discountMoney - ticketProcedureOrigin.discountMoney

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
        ticketProcedureModified,
        ticketUserCreatedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}

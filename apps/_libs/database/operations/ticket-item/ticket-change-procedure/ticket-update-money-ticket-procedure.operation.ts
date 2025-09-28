import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { BusinessError } from '../../../common/error'
import { PaymentMoneyStatus } from '../../../common/variable'
import { TicketProcedure, TicketUser } from '../../../entities'
import { PositionType } from '../../../entities/position.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  TicketProcedureRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../repositories'
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
    private ticketRepository: TicketRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateMoneyTicketProcedure<T extends TicketProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: string
    ticketProcedureId: string
    ticketProcedureUpdateDto: NoExtra<TicketProcedureUpdateDtoType, T>
  }) {
    const { oid, ticketId, ticketProcedureId, ticketProcedureUpdateDto } = params

    const PREFIX = `ticketId=${ticketId} updateTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. UPDATE TICKET PROCEDURE ===
      const ticketProcedureOrigin = await this.ticketProcedureRepository.managerFindOneBy(manager, {
        oid,
        ticketId,
        id: ticketProcedureId,
      })

      if (
        [PaymentMoneyStatus.PartialPaid, PaymentMoneyStatus.FullPaid].includes(
          ticketProcedureOrigin.paymentMoneyStatus
        )
      ) {
        throw new BusinessError('Không thể sửa phiếu đã thanh toán')
      }

      let ticketUserDestroyedList: TicketUser[] = []
      let ticketUserCreatedList: TicketUser[] = []
      let commissionMoneyChange = 0
      if (ticketProcedureOrigin.commissionAmount) {
        ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
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
      const ticketProcedureModified = await this.ticketProcedureRepository.managerUpdateOne(
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

import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../../../../../_libs/database/common/error'
import { PaymentMoneyStatus } from '../../../../../../_libs/database/common/variable'
import { TicketProcedure, TicketUser } from '../../../../../../_libs/database/entities'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../../../../../../_libs/database/operations/ticket-item/ticket-change-user/ticket-user.common'
import {
  TicketProcedureRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpdateMoneyTicketProcedureBody } from '../request'

type TicketProcedureUpdateDtoType = Pick<
  TicketProcedure,
  'expectedPrice' | 'discountType' | 'discountMoney' | 'discountPercent' | 'actualPrice'
>

@Injectable()
export class TicketUpdateMoneyTicketProcedureService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketUserCommon: TicketUserCommon,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateMoneyTicketProcedure<T extends TicketProcedureUpdateDtoType>(props: {
    oid: number
    ticketId: string
    ticketProcedureId: string
    body: TicketUpdateMoneyTicketProcedureBody
  }) {
    const { oid, ticketId, ticketProcedureId, body } = props

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
              ticketItemExpectedPrice: body.expectedPrice,
              ticketItemActualPrice: body.actualPrice,
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
          expectedPrice: body.expectedPrice,
          discountType: body.discountType,
          discountMoney: body.discountMoney,
          discountPercent: body.discountPercent,
          actualPrice: body.actualPrice,
          commissionAmount: ticketProcedureOrigin.commissionAmount + commissionMoneyChange,
        }
      )
      const procedureMoneyChange =
        ticketProcedureModified.quantity * ticketProcedureModified.actualPrice
        - ticketProcedureOrigin.quantity * ticketProcedureOrigin.actualPrice
      const itemsDiscountChange =
        ticketProcedureModified.quantity * ticketProcedureModified.discountMoney
        - ticketProcedureOrigin.quantity * ticketProcedureOrigin.discountMoney

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

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketUser: {
          destroyedList: ticketUserDestroyedList || [],
          upsertedList: ticketUserCreatedList || [],
        },
        ticketProcedure: { upsertedList: [ticketProcedureModified] },
      })
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

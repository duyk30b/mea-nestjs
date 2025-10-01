import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../../../../../_libs/database/common/error'
import { PaymentMoneyStatus } from '../../../../../../_libs/database/common/variable'
import { TicketUser } from '../../../../../../_libs/database/entities'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import TicketLaboratory from '../../../../../../_libs/database/entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import { TicketUserCommon } from '../../../../../../_libs/database/operations/ticket-item/ticket-change-user/ticket-user.common'
import {
  TicketLaboratoryManager,
  TicketManager,
  TicketUserManager,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpdateRequestTicketLaboratoryBody } from '../request'

@Injectable()
export class TicketUpdateRequestTicketLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private ticketUserManager: TicketUserManager,
    private ticketUserCommon: TicketUserCommon
  ) { }

  async updateRequestTicketLaboratory(props: {
    oid: number
    ticketId: string
    ticketLaboratoryId: string
    body: TicketUpdateRequestTicketLaboratoryBody
  }) {
    const { oid, ticketId, ticketLaboratoryId, body } = props
    const { ticketLaboratory, ticketUserRequestList } = body
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

      if (
        [PaymentMoneyStatus.PartialPaid, PaymentMoneyStatus.FullPaid].includes(
          ticketLaboratoryOrigin.paymentMoneyStatus
        )
      ) {
        throw new BusinessError('Xét nghiệm đã thanh toán không thể sửa')
      }

      let ticketLaboratoryModified: TicketLaboratory = ticketLaboratoryOrigin
      let laboratoryMoneyAdd = 0
      let itemsDiscountAdd = 0
      let itemsCostAmountAdd = 0
      if (ticketLaboratory) {
        ticketLaboratoryModified = await this.ticketLaboratoryManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketLaboratoryId },
          {
            expectedPrice: ticketLaboratory.expectedPrice,
            discountType: ticketLaboratory.discountType,
            discountMoney: ticketLaboratory.discountMoney,
            discountPercent: ticketLaboratory.discountPercent,
            actualPrice: ticketLaboratory.actualPrice,
          }
        )
        laboratoryMoneyAdd =
          ticketLaboratoryModified.actualPrice - ticketLaboratoryOrigin.actualPrice
        itemsDiscountAdd =
          ticketLaboratoryModified.discountMoney - ticketLaboratoryOrigin.discountMoney
        itemsCostAmountAdd = ticketLaboratoryModified.costPrice - ticketLaboratoryOrigin.costPrice
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

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketLaboratory: { upsertedList: [ticketLaboratoryModified] },
        ticketUser: { upsertedList: ticketUserCreatedList, destroyedList: ticketUserDestroyedList },
      })

      return {
        ticketModified,
        ticketLaboratoryModified,
        ticketUserDestroyedList,
        ticketUserCreatedList,
      }
    })

    return transaction
  }
}

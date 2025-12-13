import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BusinessError } from '../../../../../../_libs/database/common/error'
import {
  PaymentMoneyStatus,
  TicketRegimenStatus,
} from '../../../../../../_libs/database/common/variable'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import {
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../../_libs/database/entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import {
  TicketProcedureRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'

@Injectable()
export class TicketDestroyTicketRegimenService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketRegimenRepository: TicketRegimenRepository,
    private ticketRegimenItemRepository: TicketRegimenItemRepository,
    private ticketProcedureRepository: TicketProcedureRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketRegimen(params: { oid: number; ticketId: string; ticketRegimenId: string }) {
    const { oid, ticketId, ticketRegimenId } = params
    const PREFIX = `ticketId=${ticketId} addTicketRegimen failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET REGIMEN ===
      const ticketRegimenDestroyed = await this.ticketRegimenRepository.managerDeleteOne(manager, {
        oid,
        ticketId,
        id: ticketRegimenId,
      })

      if (
        ![TicketRegimenStatus.Empty, TicketRegimenStatus.Pending].includes(
          ticketRegimenDestroyed.status
        )
      ) {
        throw new BusinessError('Trạng thái liệu trình không hợp lệ')
      }
      if (
        ticketRegimenDestroyed.moneyAmountUsed !== 0
        || ticketRegimenDestroyed.costAmount !== 0
        || ticketRegimenDestroyed.paid !== 0
        || ticketRegimenDestroyed.paidItem !== 0
        || ticketRegimenDestroyed.debt !== 0
      ) {
        throw new BusinessError('Liệu trình đã sử dụng tiền không thể xóa')
      }

      // === 3. DELETE TICKET_REGIMEN_ITEM ===
      const ticketRegimenItemDestroyedList = await this.ticketRegimenItemRepository.managerDelete(
        manager,
        { oid, ticketId, ticketRegimenId }
      )

      ticketRegimenItemDestroyedList.forEach((i) => {
        if (i.quantityUsed > 0 || i.moneyAmountUsed > 0) {
          throw new BusinessError('Không thể xóa liệu trình có buổi hoàn thành')
        }
      })

      const ticketProcedureDestroyedList = await this.ticketProcedureRepository.managerDelete(
        manager,
        {
          oid,
          ticketId,
          ticketRegimenId,
          ticketProcedureType: TicketProcedureType.InRegimen,
        }
      )

      ticketProcedureDestroyedList.forEach((i) => {
        if (i.status === TicketProcedureStatus.Completed) {
          throw new BusinessError('Không thể xóa dịch vụ đã thực hiện')
        }
        if (
          ![
            PaymentMoneyStatus.NoEffect,
            PaymentMoneyStatus.TicketPaid,
            PaymentMoneyStatus.PendingPayment,
          ].includes(i.paymentMoneyStatus)
        ) {
          throw new BusinessError('Không thể xóa dịch vụ đã thanh toán')
        }
      })

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyedList = await this.ticketUserRepository.managerDelete(manager, {
        oid,
        positionType: { IN: [PositionType.RegimenRequest] },
        ticketId,
        ticketItemId: ticketRegimenDestroyed.id,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const procedureMoneyDelete = ticketProcedureDestroyedList.reduce((acc, item) => {
        const money =
          item.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
            ? item.actualPrice * item.quantity
            : 0
        return acc + money
      }, 0)
      const itemsDiscountDelete = ticketProcedureDestroyedList.reduce((acc, item) => {
        const discount =
          item.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
            ? item.discountMoney * item.quantity
            : 0
        return acc + discount
      }, 0)
      const commissionMoneyDelete = ticketUserDestroyedList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let ticketModified: Ticket = ticketOrigin
      if (procedureMoneyDelete != 0 || itemsDiscountDelete != 0 || commissionMoneyDelete != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: -procedureMoneyDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketUser: { destroyedList: ticketUserDestroyedList || [] },
        ticketRegimen: { destroyedList: [ticketRegimenDestroyed] },
        ticketRegimenItem: { destroyedList: ticketRegimenItemDestroyedList },
        ticketProcedure: { destroyedList: ticketProcedureDestroyedList },
      })

      return {
        ticketModified,
        ticketRegimenDestroyed,
        ticketRegimenItemDestroyedList,
        ticketProcedureDestroyedList,
        ticketUserDestroyedList,
      }
    })

    return transaction
  }
}

import { Injectable } from '@nestjs/common'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  PaymentMoneyStatus,
  TicketLaboratoryStatus,
} from '../../../../../../_libs/database/common/variable'
import { TicketLaboratoryInsertType } from '../../../../../../_libs/database/entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import {
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpdateTicketLaboratoryGroupBody } from '../request'

@Injectable()
export class TicketUpdateTicketLaboratoryGroupService {
  constructor(
    private socketEmitService: SocketEmitService,
    private ticketRepository: TicketRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async updateTicketLaboratoryGroup(props: {
    oid: number
    ticketId: string
    body: TicketUpdateTicketLaboratoryGroupBody
  }) {
    const { oid, ticketId, body } = props
    const { ticketLaboratoryGroupUpdate } = body

    const transaction = await this.ticketRepository.transaction(
      'READ UNCOMMITTED',
      async (manager) => {
        // === 1. UPDATE TICKET FOR TRANSACTION ===
        const ticketOrigin = await this.ticketRepository.managerUpdateOne(
          manager,
          { oid, id: ticketId, status: TicketStatus.Executing },
          { updatedAt: Date.now() }
        )

        // === 2. INSERT NEW ===

        const tlgModified = await this.ticketLaboratoryGroupRepository.managerUpdateOne(
          manager,
          { oid, ticketId, id: ticketLaboratoryGroupUpdate.id },
          {
            createdAt: ticketLaboratoryGroupUpdate.createdAt,
            roomId: ticketLaboratoryGroupUpdate.roomId,
          }
        )

        const tlDestroyedList = await this.ticketLaboratoryRepository.managerDelete(manager, {
          oid,
          ticketId,
          ticketLaboratoryGroupId: ticketLaboratoryGroupUpdate.id,
        })

        const tlCreatedList = await this.ticketLaboratoryRepository.managerInsertMany(
          manager,
          ticketLaboratoryGroupUpdate.ticketLaboratoryList.map((tlDto) => {
            const tlEntity = {
              ...tlDto,
              id: GenerateId.nextId(),
              oid,
              ticketId,
              customerId: ticketOrigin.customerId,
              ticketLaboratoryGroupId: tlgModified.id,
              roomId: tlgModified.roomId,
              status: TicketLaboratoryStatus.Pending,
              completedAt: null,
              paymentMoneyStatus: ticketOrigin.isPaymentEachItem
                ? PaymentMoneyStatus.PendingPayment
                : PaymentMoneyStatus.TicketPaid,
            } satisfies TicketLaboratoryInsertType
            return tlEntity
          })
        )

        // === 5. UPDATE TICKET: MONEY  ===
        const laboratoryMoneyAdd =
          tlCreatedList.reduce((acc, cur) => {
            return acc + cur.actualPrice
          }, 0)
          - tlDestroyedList.reduce((acc, cur) => {
            return acc + cur.actualPrice
          }, 0)
        const itemsDiscountAdd =
          tlCreatedList.reduce((acc, cur) => {
            return acc + cur.discountMoney
          }, 0)
          - tlDestroyedList.reduce((acc, cur) => {
            return acc + cur.discountMoney
          }, 0)
        const itemsCostAmountAdd =
          tlCreatedList.reduce((acc, cur) => {
            return acc + cur.costPrice
          }, 0)
          - tlDestroyedList.reduce((acc, cur) => {
            return acc + cur.costPrice
          }, 0)

        let ticketModified: Ticket = ticketOrigin
        if (laboratoryMoneyAdd != 0 || itemsDiscountAdd != 0 || itemsCostAmountAdd !== 0) {
          ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
            manager,
            oid,
            ticketOrigin,
            itemMoney: {
              laboratoryMoneyAdd,
              itemsDiscountAdd,
              itemsCostAmountAdd,
            },
          })
        }

        this.socketEmitService.socketTicketChange(oid, {
          ticketId,
          ticketModified,
          ticketLaboratory: { upsertedList: tlCreatedList, destroyedList: tlDestroyedList },
          ticketLaboratoryGroup: { upsertedList: [tlgModified] },
        })

        return {
          ticketModified,
          ticketLaboratoryCreatedList: tlCreatedList,
          ticketLaboratoryDestroyedList: tlDestroyedList,
          ticketLaboratoryGroupCreatedList: [tlgModified],
        }
      }
    )

    return transaction
  }
}

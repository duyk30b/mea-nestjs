import { Injectable } from '@nestjs/common'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  PaymentMoneyStatus,
  TicketLaboratoryStatus,
} from '../../../../../../_libs/database/common/variable'
import { TicketLaboratoryGroupInsertType } from '../../../../../../_libs/database/entities/ticket-laboratory-group.entity'
import { TicketLaboratoryInsertType } from '../../../../../../_libs/database/entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import {
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketAddTicketLaboratoryGroupBody } from '../request'

@Injectable()
export class TicketAddTicketLaboratoryGroupService {
  constructor(
    private socketEmitService: SocketEmitService,
    private ticketRepository: TicketRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketLaboratoryGroup(props: {
    oid: number
    ticketId: string
    body: TicketAddTicketLaboratoryGroupBody
  }) {
    const { oid, ticketId, body } = props
    const { ticketLaboratoryGroupAddList } = body

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
        const tlgCreatedList = await this.ticketLaboratoryGroupRepository.managerInsertMany(
          manager,
          ticketLaboratoryGroupAddList.map((tlgAdd) => {
            const { ticketLaboratoryList, ...tlgAddOther } = tlgAdd
            const tlgEntity = {
              ...tlgAddOther,
              id: GenerateId.nextId(),
              oid,
              ticketId,
              roomId: tlgAddOther.roomId,
              customerId: ticketOrigin.customerId,
              status: TicketLaboratoryStatus.Pending,
              paymentMoneyStatus: ticketOrigin.isPaymentEachItem
                ? PaymentMoneyStatus.PendingPayment
                : PaymentMoneyStatus.TicketPaid,
              completedAt: null,
              result: '',
            } satisfies TicketLaboratoryGroupInsertType
            return tlgEntity
          })
        )

        const tlCreatedList = await this.ticketLaboratoryRepository.managerInsertMany(
          manager,
          ticketLaboratoryGroupAddList
            .map((tlgAdd, tlgAddIndex) => {
              return tlgAdd.ticketLaboratoryList.map((tlDto) => {
                const tlEntity = {
                  ...tlDto,
                  id: GenerateId.nextId(),
                  oid,
                  ticketId,
                  customerId: ticketOrigin.customerId,
                  ticketLaboratoryGroupId: tlgCreatedList[tlgAddIndex].id,
                  roomId: tlgCreatedList[tlgAddIndex].roomId,
                  status: TicketLaboratoryStatus.Pending,
                  paymentMoneyStatus: ticketOrigin.isPaymentEachItem
                    ? PaymentMoneyStatus.PendingPayment
                    : PaymentMoneyStatus.TicketPaid,
                  completedAt: null,
                  paid: 0,
                  debt: 0,
                } satisfies TicketLaboratoryInsertType
                return tlEntity
              })
            })
            .flat()
        )

        // === 5. UPDATE TICKET: MONEY  ===
        const laboratoryMoneyAdd = tlCreatedList.reduce((acc, cur) => {
          return acc + cur.actualPrice
        }, 0)
        const itemsDiscountAdd = tlCreatedList.reduce((acc, cur) => {
          return acc + cur.discountMoney
        }, 0)
        const itemsCostAmountAdd = tlCreatedList.reduce((acc, cur) => {
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
          ticketLaboratory: { upsertedList: tlCreatedList },
          ticketLaboratoryGroup: { upsertedList: tlgCreatedList },
        })

        return {
          ticketModified,
          ticketLaboratoryCreatedList: tlCreatedList,
          ticketLaboratoryGroupCreatedList: tlgCreatedList,
        }
      }
    )

    return transaction
  }
}

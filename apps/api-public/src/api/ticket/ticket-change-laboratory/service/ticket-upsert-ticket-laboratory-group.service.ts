import { Injectable } from '@nestjs/common'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  PaymentMoneyStatus,
  TicketLaboratoryStatus,
} from '../../../../../../_libs/database/common/variable'
import { TicketLaboratoryGroup } from '../../../../../../_libs/database/entities'
import { TicketLaboratoryGroupInsertType } from '../../../../../../_libs/database/entities/ticket-laboratory-group.entity'
import TicketLaboratory, {
  TicketLaboratoryInsertType,
} from '../../../../../../_libs/database/entities/ticket-laboratory.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import {
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketUpsertRequestLaboratoryGroupBody } from '../request'

@Injectable()
export class TicketUpsertLaboratoryService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private ticketRepository: TicketRepository,
    private ticketLaboratoryRepository: TicketLaboratoryRepository,
    private ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async upsertRequestLaboratoryGroup(props: {
    oid: number
    ticketId: string
    body: TicketUpsertRequestLaboratoryGroupBody
  }) {
    const { oid, ticketId, body } = props
    const { ticketLaboratoryGroupAddList, ticketLaboratoryGroupUpdate } = body

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
        let tlgCreatedList: TicketLaboratoryGroup[] = []
        let tlCreatedList1: TicketLaboratory[] = []
        let tlgModified: TicketLaboratoryGroup
        let tlDestroyedList: TicketLaboratory[] = []
        let tlCreatedList2: TicketLaboratory[] = []
        if (ticketLaboratoryGroupAddList?.length) {
          const tlgEntityList = ticketLaboratoryGroupAddList.map((tlgAdd) => {
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
          tlgCreatedList = await this.ticketLaboratoryGroupRepository.managerInsertMany(
            manager,
            tlgEntityList
          )

          const tlEntityList = ticketLaboratoryGroupAddList
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
                } satisfies TicketLaboratoryInsertType
                return tlEntity
              })
            })
            .flat()
          tlCreatedList1 = await this.ticketLaboratoryRepository.managerInsertMany(
            manager,
            tlEntityList
          )
        }

        if (ticketLaboratoryGroupUpdate) {
          tlgModified = await this.ticketLaboratoryGroupRepository.managerUpdateOne(
            manager,
            { oid, ticketId, id: ticketLaboratoryGroupUpdate.id },
            {
              createdAt: ticketLaboratoryGroupUpdate.createdAt,
              roomId: ticketLaboratoryGroupUpdate.roomId,
            }
          )

          tlDestroyedList = await this.ticketLaboratoryRepository.managerDelete(manager, {
            oid,
            ticketId,
            ticketLaboratoryGroupId: ticketLaboratoryGroupUpdate.id,
          })

          const tlEntityList = ticketLaboratoryGroupUpdate.ticketLaboratoryList.map((tlDto) => {
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

          tlCreatedList2 = await this.ticketLaboratoryRepository.managerInsertMany(
            manager,
            tlEntityList
          )
        }

        // === 5. UPDATE TICKET: MONEY  ===
        const tlCreatedList = [...tlCreatedList1, ...tlCreatedList2]

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
        if (laboratoryMoneyAdd != 0 || itemsDiscountAdd != 0) {
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

        const tlgUpsertList = [...tlgCreatedList]
        if (tlgModified) tlgUpsertList.push(tlgModified)

        this.socketEmitService.socketTicketChange(oid, {
          ticketId,
          ticketModified,
          ticketLaboratory: { upsertedList: tlCreatedList, destroyedList: tlDestroyedList },
          ticketLaboratoryGroup: { upsertedList: tlgUpsertList },
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

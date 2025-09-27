import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import {
  DeliveryStatus,
  PaymentEffect,
  PaymentMoneyStatus,
} from '../../../../../../_libs/database/common/variable'
import {
  TicketProductInsertType,
  TicketProductType,
} from '../../../../../../_libs/database/entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../../../../_libs/database/entities/ticket.entity'
import { TicketChangeItemMoneyManager } from '../../../../../../_libs/database/operations/ticket-base/ticket-change-item-money.manager'
import {
  TicketManager,
  TicketProductRepository,
} from '../../../../../../_libs/database/repositories'
import { SocketEmitService } from '../../../../socket/socket-emit.service'
import { TicketAddTicketProductListBody } from '../request'

@Injectable()
export class TicketAddTicketProductService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductRepository: TicketProductRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketProductList(props: {
    oid: number
    ticketId: string
    ticketProductType: TicketProductType
    body: TicketAddTicketProductListBody
  }) {
    const { oid, ticketId, ticketProductType, body } = props

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: TicketStatus.Executing,
        },
        { updatedAt: Date.now(), deliveryStatus: DeliveryStatus.Pending }
      )

      // === 2. INSERT NEW ===
      const ticketProductInsertList = body.ticketProductList.map((i) => {
        const insert: TicketProductInsertType = {
          ...i,
          id: GenerateId.nextId(),
          oid,
          ticketId,
          customerId: ticketOrigin.customerId,
          deliveryStatus: DeliveryStatus.Pending,
          costAmount: i.costAmount, // set tạm thế, khi nào gửi hàng chọn lô mới tính chính xác được
          pickupStrategy: i.pickupStrategy, // nếu không xuất kho thì costAmount lấy giá trị trên luôn
          type: ticketProductType,
          ticketProcedureId: '0',
          paymentMoneyStatus: PaymentMoneyStatus.PendingPaid,
          paymentEffect: PaymentEffect.SelfPayment,
        }
        return insert
      })
      const ticketProductList = await this.ticketProductRepository.managerInsertMany(
        manager,
        ticketProductInsertList
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const productMoneyAdd = ticketProductList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.actualPrice
      }, 0)
      const itemsDiscountAdd = ticketProductList.reduce((acc, cur) => {
        return acc + cur.quantity * cur.discountMoney
      }, 0)
      const itemsCostAmountAdd = ticketProductList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      let ticketModified: Ticket = ticketOrigin
      if (productMoneyAdd != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd,
            itemsDiscountAdd,
            itemsCostAmountAdd,
          },
        })
      }

      this.socketEmitService.socketTicketChange(oid, {
        ticketId,
        ticketModified,
        ticketProduct: { upsertedList: ticketProductList },
      })

      return { ticketModified, ticketProductList }
    })

    return transaction
  }
}

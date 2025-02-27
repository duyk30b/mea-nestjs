import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus, PaymentType } from '../../common/variable'
import {
  Customer,
  TicketLaboratory,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
} from '../../entities'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, CustomerPaymentManager, TicketManager } from '../../managers'

@Injectable()
export class TicketPaymentAndCloseOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private customerManager: CustomerManager,
    private customerPaymentManager: CustomerPaymentManager
  ) { }

  async paymentAndClose(params: { oid: number; ticketId: number; time: number; money: number }) {
    const { oid, ticketId, time, money } = params
    const PREFIX = `ticketId=${ticketId} close failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: { IN: [TicketStatus.Draft, TicketStatus.Approved, TicketStatus.Executing] },
        },
        { updatedAt: Date.now() }
      )

      // === 2. TICKET: Update profit and discountItems ===
      const ticketProcedureList = await manager.find(TicketProcedure, {
        where: { ticketId },
      })
      const ticketProductList = await manager.find(TicketProduct, {
        where: { ticketId },
      })
      const ticketLaboratoryList = await manager.find(TicketLaboratory, {
        where: { ticketId },
      })
      const ticketRadiologyList = await manager.find(TicketRadiology, {
        where: { ticketId },
      })

      if (ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
        throw new Error('Không thể đóng phiếu khi chưa xuất hết hàng')
      }

      const procedureDiscount = ticketProcedureList.reduce((acc, item) => {
        return acc + item.discountMoney * item.quantity
      }, 0)
      const productDiscount = ticketProductList.reduce((acc, item) => {
        return acc + item.discountMoney * item.quantity
      }, 0)
      const laboratoryDiscount = ticketLaboratoryList.reduce((acc, item) => {
        return acc + item.discountMoney
      }, 0)
      const radiologyDiscount = ticketRadiologyList.reduce((acc, item) => {
        return acc + item.discountMoney
      }, 0)
      const itemsDiscount =
        procedureDiscount + productDiscount + laboratoryDiscount + radiologyDiscount

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          ticketStatus: () => `CASE 
                                WHEN("totalMoney" = paid + ${money}) THEN ${TicketStatus.Completed} 
                                ELSE ${TicketStatus.Debt} 
                              END
                            `,
          paid: () => `paid + ${money}`,
          debt: () => `debt - ${money}`,
          itemsDiscount,
          profit: () => `"totalMoney" - "itemsCostAmount" - "expense"`,
          endedAt: time,
        }
      )

      if (ticket.paid > ticket.totalMoney) {
        throw new Error(`${PREFIX}: Money invalid, ticket=${ticket}`)
      }
      if (ticket.debt == 0 && money == 0) return { ticket }

      let customer: Customer
      if (ticket.debt > 0) {
        customer = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticket.customerId },
          { debt: () => `debt + ${ticket.debt}` }
        )
      } else {
        customer = await manager.findOneBy(Customer, { oid, id: ticket.customerId })
      }

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt - ticket.debt

      // === 3. INSERT CUSTOMER_PAYMENT ===
      const customerPaymentInsert: CustomerPaymentInsertType = {
        oid,
        customerId: ticket.customerId,
        ticketId,
        createdAt: time,
        paymentType: PaymentType.Close,
        paid: money,
        debit: ticket.debt,
        openDebt: customerOpenDebt,
        closeDebt: customerCloseDebt,
        note: '',
        description: '',
      }
      const customerPayment = await this.customerPaymentManager.insertOneAndReturnEntity(
        manager,
        customerPaymentInsert
      )

      return { ticket, customer, customerPayment }
    })
  }
}

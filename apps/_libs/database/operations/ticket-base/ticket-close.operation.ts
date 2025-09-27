import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus } from '../../common/variable'
import { Customer, TicketUser } from '../../entities'
import Payment, {
  MoneyDirection,
  PaymentActionType,
  PaymentInsertType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../entities/payment.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  CustomerManager,
  PaymentManager,
  TicketLaboratoryManager,
  TicketManager,
  TicketProcedureManager,
  TicketProductManager,
  TicketRadiologyManager,
  TicketUserManager,
} from '../../repositories'
import { TicketCalculatorMoney } from './ticket-calculator-money.operator'
import { TicketUpdateCommissionTicketUserOperator } from './ticket-update-commission-ticket-user.operator'

@Injectable()
export class TicketCloseOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketProductManager: TicketProductManager,
    private ticketLaboratoryManager: TicketLaboratoryManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketUserManager: TicketUserManager,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager,
    private ticketUpdateCommissionTicketUserOperator: TicketUpdateCommissionTicketUserOperator,
    private ticketCalculatorMoney: TicketCalculatorMoney
  ) { }

  async startClose(params: {
    oid: number
    ticketId: string
    time: number
    note: string
    userId: number
  }) {
    const { oid, ticketId, time, note, userId } = params
    const PREFIX = `ticketId=${ticketId} close failed`

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketUpdated = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [TicketStatus.Draft, TicketStatus.Deposited, TicketStatus.Executing],
          },
        },
        {
          status: () => `CASE 
                            WHEN(paid > "totalMoney") THEN ${TicketStatus.Executing} 
                            WHEN(paid < "totalMoney") THEN ${TicketStatus.Debt} 
                            ELSE ${TicketStatus.Completed}
                        END
                        `,
          updatedAt: time,
          endedAt: time,
        }
      )

      // === 2. TICKET: Update profit and discountItems ===

      const ticketProcedureList = await this.ticketProcedureManager.findManyBy(manager, {
        ticketId,
      })
      const ticketProductList = await this.ticketProductManager.findManyBy(manager, { ticketId })
      const ticketLaboratoryList = await this.ticketLaboratoryManager.findManyBy(manager, {
        ticketId,
      })
      const ticketRadiologyList = await this.ticketRadiologyManager.findManyBy(manager, {
        ticketId,
      })
      const ticketUserList = await this.ticketUserManager.findManyBy(manager, { ticketId })

      if (ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
        throw new Error('Không thể đóng phiếu khi chưa xuất hết hàng')
      }

      let ticketUserModifiedList: TicketUser[] = []
      let ticketUserDestroyedList: TicketUser[] = []
      const ticketUserDeletedList: TicketUser[] = []
      if (ticketUserList.length) {
        const response =
          await this.ticketUpdateCommissionTicketUserOperator.updateCommissionTicketUser({
            manager,
            oid,
            ticketId,
            ticketOrigin: ticketUpdated,
            ticketLaboratoryList,
            ticketProcedureList,
            ticketProductList,
            ticketRadiologyList,
          })
        ticketUserModifiedList = response.ticketUserModifiedList
        ticketUserDestroyedList = response.ticketUserDestroyedList
      }

      const ticketFix = this.ticketCalculatorMoney.reCalculatorMoney({
        oid,
        ticketOrigin: ticketUpdated,
        ticketProcedureList,
        ticketProductList,
        ticketLaboratoryList,
        ticketRadiologyList,
        ticketUserList: ticketUserModifiedList,
      })

      let customerModified: Customer
      const paymentCreatedList: Payment[] = []
      if (ticketUpdated.debt) {
        let paidByTopUp = 0
        const customerOrigin = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketUpdated.customerId },
          { updatedAt: Date.now() }
        )
        if (customerOrigin.debt < 0) {
          const topUpMoney = -customerOrigin.debt
          paidByTopUp = Math.min(ticketUpdated.debt, topUpMoney)
        }
        const newDebtTicket = ticketUpdated.debt - paidByTopUp
        const newDebtCustomer = customerOrigin.debt + paidByTopUp + newDebtTicket
        // const newDebtCustomer = customerOrigin.debt + ticketUpdated.debt ==> tính đi tính lại thì nó vẫn thế này

        customerModified = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticketUpdated.customerId },
          { debt: newDebtCustomer }
        )

        ticketFix.debt = newDebtTicket

        const paymentInsert: PaymentInsertType = {
          oid,
          voucherType: PaymentVoucherType.Ticket,
          voucherId: ticketId,
          personType: PaymentPersonType.Customer,
          personId: ticketUpdated.customerId,

          cashierId: userId,
          paymentMethodId: 0,
          createdAt: time,
          paymentActionType: PaymentActionType.Close,
          moneyDirection: MoneyDirection.Other,
          note: note || '',

          paidAmount: 0,
          debtAmount: paidByTopUp + ticketFix.debt, // thực ra thì vẫn = purchaseOrderUpdated.debt
          openDebt: customerOrigin.debt,
          closeDebt: customerModified.debt,
        }
        const paymentCreated = await this.paymentManager.insertOneAndReturnEntity(
          manager,
          paymentInsert
        )
        paymentCreatedList.push(paymentCreated)
      }

      const ticketModified = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketUpdated.id },
        ticketFix
      )

      await queryRunner.commitTransaction()
      return {
        ticketModified,
        customerModified,
        ticketUserModifiedList,
        ticketUserDeletedList,
        paymentCreatedList,
      }
    } catch (error) {
      console.error('error:', error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}

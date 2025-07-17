import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus } from '../../common/variable'
import {
  Customer,
  TicketLaboratory,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketUser,
} from '../../entities'
import Payment, {
  MoneyDirection,
  PaymentInsertType,
  PaymentTiming,
  PersonType,
  VoucherType,
} from '../../entities/payment.entity'
import { CommissionCalculatorType, PositionInteractType } from '../../entities/position.entity'
import { TicketProductType } from '../../entities/ticket-product.entity'
import { TicketUserInsertType } from '../../entities/ticket-user.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import { CustomerManager, PaymentManager, TicketManager } from '../../managers'
import { TicketUserManager } from '../../repositories'

@Injectable()
export class TicketPaymentAndCloseOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketUserManager: TicketUserManager,
    private customerManager: CustomerManager,
    private paymentManager: PaymentManager
  ) { }

  async paymentAndClose(params: {
    oid: number
    ticketId: number
    paymentMethodId: number
    time: number
    money: number
    note: string
    cashierId: number
  }) {
    const { oid, ticketId, paymentMethodId, time, money, note, cashierId } = params
    const PREFIX = `ticketId=${ticketId} close failed`

    if (money < 0) {
      throw new Error(`${PREFIX}: money = ${money}`)
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ UNCOMMITTED')
    try {
      const manager = queryRunner.manager
      // === 1. TICKET: Update status để tạo transaction ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [TicketStatus.Draft, TicketStatus.Deposited, TicketStatus.Executing],
          },
          debt: { GTE: money }, // số tiền thanh toán đương nhiên phải nhỏ hơn số nợ
        },
        { updatedAt: time, endedAt: time }
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
      const ticketUserList = await this.ticketUserManager.findMany(manager, {
        condition: { ticketId },
      })

      if (ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Pending)) {
        throw new Error('Không thể đóng phiếu khi chưa xuất hết hàng')
      }

      let commissionMoney = 0

      let ticketUserModifiedList: TicketUser[] = []
      let ticketUserDeletedList: TicketUser[] = []
      if (ticketUserList.length) {
        const ticketUserRemoveList: TicketUser[] = []
        const ticketUserUpdateList = ticketUserList.map((tu) => {
          let commissionMoney = 0
          let commissionPercentActual = 0
          let commissionPercentExpected = 0

          let ticketItemExpectedPrice = 0
          let ticketItemActualPrice = 0

          if (tu.positionType === PositionInteractType.Ticket) {
            ticketItemExpectedPrice = ticketOrigin.totalMoney + ticketOrigin.discountMoney
            ticketItemActualPrice = ticketOrigin.totalMoney
          }
          if (tu.positionType === PositionInteractType.Product) {
            const ticketProduct = ticketProductList.find((i) => i.id === tu.ticketItemId)
            if (!ticketProduct) ticketUserRemoveList.push(tu)

            ticketItemExpectedPrice = ticketProduct?.expectedPrice || 0
            ticketItemActualPrice = ticketProduct?.actualPrice || 0
          }
          if (tu.positionType === PositionInteractType.Procedure) {
            const ticketProcedure = ticketProcedureList.find((i) => i.id === tu.ticketItemId)
            if (!ticketProcedure) ticketUserRemoveList.push(tu)
            ticketItemExpectedPrice = ticketProcedure.expectedPrice || 0
            ticketItemActualPrice = ticketProcedure.actualPrice || 0
          }
          if (tu.positionType === PositionInteractType.Radiology) {
            const ticketRadiology = ticketRadiologyList.find((i) => i.id === tu.ticketItemId)
            if (!ticketRadiology) ticketUserRemoveList.push(tu)
            ticketItemExpectedPrice = ticketRadiology.expectedPrice || 0
            ticketItemActualPrice = ticketRadiology.actualPrice || 0
          }
          if (tu.positionType === PositionInteractType.Laboratory) {
            const ticketLaboratory = ticketLaboratoryList.find((i) => i.id === tu.ticketItemId)
            if (!ticketLaboratory) ticketUserRemoveList.push(tu)
            ticketItemExpectedPrice = ticketLaboratory.expectedPrice || 0
            ticketItemActualPrice = ticketLaboratory.actualPrice || 0
          }
          if (tu.positionType === PositionInteractType.ConsumableList) {
            const ticketProductConsumableList = ticketProductList.filter((i) => {
              return i.type === TicketProductType.Consumable
            })
            ticketItemExpectedPrice = ticketProductConsumableList.reduce((acc, cur) => {
              return acc + cur.expectedPrice * cur.quantity
            }, 0)
            ticketItemActualPrice = ticketProductConsumableList.reduce((acc, cur) => {
              return acc + cur.actualPrice * cur.quantity
            }, 0)
          }
          if (tu.positionType === PositionInteractType.PrescriptionList) {
            const ticketProductPrescriptionList = ticketProductList.filter((i) => {
              return i.type === TicketProductType.Prescription
            })
            ticketItemExpectedPrice = ticketProductPrescriptionList.reduce((acc, cur) => {
              return acc + cur.expectedPrice * cur.quantity
            }, 0)
            ticketItemActualPrice = ticketProductPrescriptionList.reduce((acc, cur) => {
              return acc + cur.actualPrice * cur.quantity
            }, 0)
          }

          const commissionCalculatorType = tu.commissionCalculatorType
          if (commissionCalculatorType === CommissionCalculatorType.VND) {
            commissionMoney = tu.commissionMoney
            commissionPercentExpected =
              ticketItemExpectedPrice === 0
                ? 0
                : Math.floor((commissionMoney * 100) / ticketItemExpectedPrice)
            commissionPercentActual =
              ticketItemActualPrice === 0
                ? 0
                : Math.floor((commissionMoney * 100) / ticketItemActualPrice)
          }
          if (commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
            commissionPercentExpected = tu.commissionPercentExpected || 0
            commissionMoney = Math.floor(
              (ticketItemExpectedPrice * commissionPercentExpected) / 100
            )
            commissionPercentActual =
              ticketItemActualPrice === 0
                ? 0
                : Math.floor((commissionMoney * 100) / ticketItemActualPrice)
          }
          if (commissionCalculatorType === CommissionCalculatorType.PercentActual) {
            commissionPercentActual = tu.commissionPercentActual || 0
            commissionMoney = Math.floor((ticketItemActualPrice * commissionPercentActual) / 100)
            commissionPercentExpected =
              ticketItemExpectedPrice === 0
                ? 0
                : Math.floor((commissionMoney * 100) / ticketItemExpectedPrice)
          }

          const updateDto: TicketUserInsertType & { id: number } = {
            id: tu.id,
            oid,
            ticketId,
            roleId: tu.roleId,
            userId: tu.userId,
            positionInteractId: tu.positionInteractId,
            positionType: tu.positionType,
            ticketItemId: tu.ticketItemId,
            ticketItemExpectedPrice,
            ticketItemActualPrice,
            quantity: tu.quantity,
            createdAt: time,
            commissionCalculatorType,
            commissionMoney,
            commissionPercentActual,
            commissionPercentExpected,
          }
          return updateDto
        })
        commissionMoney = ticketUserUpdateList.reduce((acc, cur) => {
          return acc + cur.commissionMoney * cur.quantity
        }, 0)

        if (ticketUserRemoveList.length) {
          ticketUserDeletedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
            oid,
            id: { IN: ticketUserRemoveList.map((i) => i.id) },
          })
        }
        ticketUserModifiedList = await this.ticketUserManager.bulkUpdate({
          manager,
          tempList: ticketUserUpdateList,
          compare: ['id'],
          condition: { oid },
          update: [
            'ticketItemExpectedPrice',
            'ticketItemActualPrice',
            'commissionCalculatorType',
            'commissionMoney',
            'commissionPercentActual',
            'commissionPercentExpected',
          ],
        })
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
      const profit =
        ticketOrigin.totalMoney
        - ticketOrigin.itemsCostAmount
        - ticketOrigin.expense
        - commissionMoney

      const customerOrigin = await this.customerManager.updateOneAndReturnEntity(
        manager,
        { id: ticketOrigin.customerId },
        { updatedAt: Date.now() }
      )
      const customerOpenDebt = customerOrigin.debt
      const customerTopUpMoney = -customerOpenDebt // quỹ thực chất là nợ ở dạng số âm

      let topUpMoney = 0 // số tiền lấy thêm từ quỹ
      let newPaidTicket = ticketOrigin.paid + money
      let newDebtTicket = ticketOrigin.debt - money
      let newDebtCustomer = customerOrigin.debt + newDebtTicket
      if (newDebtTicket > 0 && customerTopUpMoney > 0) {
        // Nếu thiếu tiền, mà trong quỹ có tiền thì phải lấy thêm tiền từ quỹ ra
        topUpMoney = Math.min(newDebtTicket, customerTopUpMoney)
        newDebtTicket = newDebtTicket - topUpMoney
        newPaidTicket = newPaidTicket + topUpMoney

        // tính thế nào đi chăng nữa thì số nợ hay quỹ thì vẫn thế, nhưng cứ viết vào để hiểu
        newDebtCustomer = customerOrigin.debt + topUpMoney + newDebtTicket
      }

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          status: newDebtTicket > 0 ? TicketStatus.Debt : TicketStatus.Completed,
          paid: newPaidTicket,
          debt: newDebtTicket,
          itemsDiscount,
          profit,
          commissionMoney,
          endedAt: time,
        }
      )

      let customer: Customer
      let paymentList: Payment[]
      if (ticket.debt != 0 || money != 0 || topUpMoney != 0) {
        customer = await this.customerManager.updateOneAndReturnEntity(
          manager,
          { oid, id: ticket.customerId },
          { debt: newDebtCustomer }
        )

        const customerCloseDebt = customer.debt

        const paymentInsertList: PaymentInsertType[] = []

        if (topUpMoney != 0) {
          const paymentInsert: PaymentInsertType = {
            oid,
            paymentMethodId,
            voucherType: VoucherType.Ticket,
            voucherId: ticketId,
            personType: PersonType.Customer,
            personId: ticket.customerId,
            paymentTiming: PaymentTiming.Close,
            createdAt: time,
            moneyDirection: MoneyDirection.In,
            paidAmount: topUpMoney,
            debtAmount: topUpMoney,
            openDebt: customerOpenDebt,
            closeDebt: customerOpenDebt + topUpMoney,
            cashierId,
            note,
            description: '',
          }
          paymentInsertList.push(paymentInsert)
        }
        if (money != 0 || ticket.debt != 0) {
          const paymentInsert: PaymentInsertType = {
            oid,
            paymentMethodId,
            voucherType: VoucherType.Ticket,
            voucherId: ticketId,
            personType: PersonType.Customer,
            personId: ticket.customerId,
            paymentTiming: PaymentTiming.Close,
            createdAt: time,
            moneyDirection: MoneyDirection.In,
            paidAmount: money,
            debtAmount: ticket.debt,
            openDebt: customerOpenDebt + topUpMoney,
            closeDebt: customerOpenDebt + topUpMoney + ticket.debt,
            cashierId,
            note,
            description: '',
          }
          paymentInsertList.push(paymentInsert)
        }
        // === 3. INSERT CUSTOMER_PAYMENT ===

        paymentList = await this.paymentManager.insertManyAndReturnEntity(
          manager,
          paymentInsertList
        )
      }
      await queryRunner.commitTransaction()
      return { ticket, customer, paymentList, ticketUserModifiedList, ticketUserDeletedList }
    } catch (error) {
      console.error('error:', error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}

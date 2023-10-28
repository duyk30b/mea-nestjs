import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, In, IsNull, Raw } from 'typeorm'
import { InvoiceStatus, PaymentType } from '../../common/variable'
import {
  Customer,
  CustomerPayment,
  Invoice,
  InvoiceExpense,
  InvoiceItem,
  InvoiceSurcharge,
} from '../../entities'
import { ProductRepository } from '../product/product.repository'
import { InvoiceDraftInsertDto, InvoiceDraftUpdateDto } from './invoice.dto'

@Injectable()
export class InvoiceProcessRepository {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private productRepository: ProductRepository
  ) {}

  async createDraft(params: { oid: number; invoiceInsertDto: InvoiceDraftInsertDto }) {
    const { oid, invoiceInsertDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const { invoiceItems, ...invoiceSnap } = manager.create(Invoice, invoiceInsertDto)
      invoiceSnap.oid = oid
      invoiceSnap.status = InvoiceStatus.Draft
      invoiceSnap.paid = 0
      invoiceSnap.debt = 0

      const invoiceInsertResult = await manager.insert(Invoice, invoiceSnap)
      const invoiceId: number = invoiceInsertResult.identifiers?.[0]?.id
      if (!invoiceId) {
        throw new Error(
          `Create Invoice failed: Insert error ${JSON.stringify(invoiceInsertResult)}`
        )
      }

      const invoiceItemsSnap = manager.create(InvoiceItem, invoiceInsertDto.invoiceItems)
      invoiceItemsSnap.forEach((item) => {
        item.oid = oid
        item.invoiceId = invoiceId
        item.customerId = invoiceInsertDto.customerId
      })
      await manager.insert(InvoiceItem, invoiceItemsSnap)

      const invoiceSurchargesSnap = manager.create(
        InvoiceSurcharge,
        invoiceInsertDto.invoiceSurcharges
      )
      invoiceSurchargesSnap.forEach((item) => {
        item.oid = oid
        item.invoiceId = invoiceId
      })
      await manager.insert(InvoiceSurcharge, invoiceSurchargesSnap)

      const invoiceExpensesSnap = manager.create(InvoiceExpense, invoiceInsertDto.invoiceExpenses)
      invoiceExpensesSnap.forEach((item) => {
        item.oid = oid
        item.invoiceId = invoiceId
      })
      await manager.insert(InvoiceExpense, invoiceExpensesSnap)

      return { invoiceId }
    })
  }

  async updateDraft(params: {
    oid: number
    invoiceId: number
    invoiceUpdateDto: InvoiceDraftUpdateDto
  }) {
    const { oid, invoiceId, invoiceUpdateDto } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const { invoiceItems, invoiceExpenses, invoiceSurcharges, ...invoiceSnap } = manager.create(
        Invoice,
        invoiceUpdateDto
      )
      invoiceSnap.paid = 0
      invoiceSnap.debt = 0
      const invoiceUpdateResult = await manager.getRepository(Invoice).update(
        {
          id: invoiceId,
          oid,
          status: InvoiceStatus.Draft,
        },
        invoiceSnap
      )
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`Update Invoice ${invoiceId} failed: Status invalid`)
      }

      const invoice = await manager.findOneBy(Invoice, { id: invoiceId, oid })

      await manager.delete(InvoiceItem, { oid, invoiceId })
      await manager.delete(InvoiceSurcharge, { oid, invoiceId })
      await manager.delete(InvoiceExpense, { oid, invoiceId })

      const invoiceItemsSnap = manager.create(InvoiceItem, invoiceUpdateDto.invoiceItems)
      invoiceItemsSnap.forEach((item) => {
        item.oid = oid
        item.invoiceId = invoiceId
        item.customerId = invoice.customerId
      })
      await manager.insert(InvoiceItem, invoiceItemsSnap)

      const invoiceSurchargesSnap = manager.create(
        InvoiceSurcharge,
        invoiceUpdateDto.invoiceSurcharges
      )
      invoiceSurchargesSnap.forEach((item) => {
        item.oid = oid
        item.invoiceId = invoiceId
      })
      await manager.insert(InvoiceSurcharge, invoiceSurchargesSnap)

      const invoiceExpensesSnap = manager.create(InvoiceExpense, invoiceUpdateDto.invoiceExpenses)
      invoiceExpensesSnap.forEach((item) => {
        item.oid = oid
        item.invoiceId = invoiceId
      })
      await manager.insert(InvoiceExpense, invoiceExpensesSnap)

      return { invoiceId }
    })
  }

  async destroyDraft(params: { oid: number; invoiceId: number }) {
    const { oid, invoiceId } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const invoiceDeleteResult = await manager.delete(Invoice, {
        oid,
        id: invoiceId,
        status: InvoiceStatus.Draft,
      })
      if (invoiceDeleteResult.affected !== 1) {
        throw new Error(`Destroy Invoice ${invoiceId} failed: Status invalid`)
      }
      await manager.delete(InvoiceItem, { oid, invoiceId })
      await manager.delete(InvoiceSurcharge, { oid, invoiceId })
      await manager.delete(InvoiceExpense, { oid, invoiceId })
    })
  }

  async prepayment(params: { oid: number; invoiceId: number; time: number; money: number }) {
    const { oid, invoiceId, time, money } = params
    if (money < 0) {
      throw new Error(`Prepayment Invoice ${invoiceId} failed: Money number invalid`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const invoiceUpdateResult = await manager.getRepository(Invoice).update(
        {
          id: invoiceId,
          oid,
          status: In([InvoiceStatus.Draft, InvoiceStatus.AwaitingShipment]),
          revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
        },
        {
          status: InvoiceStatus.AwaitingShipment,
          paid: () => `paid + ${money}`,
          debt: 0, // thanh toán trước nên không tính là nợ
        }
      )
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`Prepayment Invoice ${invoiceId} failed`)
      }

      const invoice = await manager.findOne(Invoice, { where: { oid, id: invoiceId } })

      // Lưu lịch sử trả tiền
      if (money > 0) {
        const customer = await manager.findOneBy(Customer, {
          oid,
          id: invoice.customerId,
        })
        const customerCloseDebt = customer.debt
        const customerOpenDebt = customer.debt
        const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
          oid,
          customerId: invoice.customerId,
          invoiceId,
          createdAt: time,
          type: PaymentType.Prepayment,
          paid: money,
          debit: 0, // prepayment không phát sinh nợ
          customerOpenDebt,
          customerCloseDebt,
          invoiceOpenDebt: 0,
          invoiceCloseDebt: 0,
        })
        const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
        if (!customerPaymentId) {
          throw new Error(
            `Create CustomerPayment failed: ` +
              `Insert error ${JSON.stringify(customerPaymentInsertResult)}`
          )
        }
      }
    })
  }

  async payDebt(params: { oid: number; invoiceId: number; time: number; money: number }) {
    const { oid, invoiceId, time, money } = params
    if (money <= 0) {
      throw new Error(`Pay Debt Invoice ${invoiceId} failed: Money number invalid`)
    }

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const invoiceUpdateResult = await manager.getRepository(Invoice).update(
        {
          id: invoiceId,
          oid,
          status: InvoiceStatus.Debt,
          revenue: Raw((alias) => `${alias} >= (paid + :money)`, { money }),
        },
        {
          status: () => `CASE 
                            WHEN(revenue - paid = ${money}) THEN ${InvoiceStatus.Success} 
                            ELSE ${InvoiceStatus.Debt}
                            END
                        `,
          debt: () => `debt - ${money}`,
          paid: () => `paid + ${money}`,
        }
      )
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`Payment Invoice ${invoiceId} failed: Update failed`)
      }

      const [invoice] = await manager.find(Invoice, {
        relations: { invoiceItems: true },
        relationLoadStrategy: 'join',
        where: { oid, id: invoiceId },
      })

      // Trừ nợ khách hàng
      const updateCustomer = await manager.decrement<Customer>(
        Customer,
        { id: invoice.customerId },
        'debt',
        money
      )
      if (updateCustomer.affected !== 1) {
        throw new Error(
          `Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`
        )
      }
      const customer = await manager.findOneBy(Customer, {
        oid,
        id: invoice.customerId,
      })

      const customerCloseDebt = customer.debt
      const customerOpenDebt = customerCloseDebt + money
      const invoiceCloseDebt = invoice.debt
      const invoiceOpenDebt = invoiceCloseDebt + money

      // Lưu lịch sử trả tiền
      const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
        oid,
        customerId: invoice.customerId,
        invoiceId,
        createdAt: time,
        type: PaymentType.PayDebt,
        paid: money,
        debit: -money,
        customerOpenDebt,
        customerCloseDebt,
        invoiceOpenDebt,
        invoiceCloseDebt,
      })

      const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
      if (!customerPaymentId) {
        throw new Error(
          `Create CustomerPayment failed: ` +
            `Insert error ${JSON.stringify(customerPaymentInsertResult)}`
        )
      }
    })
  }

  async softDeleteRefund(params: { oid: number; invoiceId: number }) {
    const { oid, invoiceId } = params
    const invoiceUpdateResult = await this.manager.update(
      Invoice,
      {
        id: invoiceId,
        oid,
        status: InvoiceStatus.Refund,
        deletedAt: IsNull(),
      },
      { deletedAt: Date.now() }
    )
    if (invoiceUpdateResult.affected !== 1) {
      throw new Error(`Delete Invoice ${invoiceId} failed: Status invalid`)
    }
  }
}

import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, In, UpdateResult } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { InvoiceItemType, InvoiceStatus, PaymentType, VoucherType } from '../../common/variable'
import {
  Batch,
  Customer,
  CustomerPayment,
  Invoice,
  InvoiceItem,
  Product,
  ProductMovement,
} from '../../entities'
import BatchMovement, { BatchMovementInsertType } from '../../entities/batch-movement.entity'
import { CustomerPaymentInsertType } from '../../entities/customer-payment.entity'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'

@Injectable()
export class InvoiceReturnProduct {
  constructor(private dataSource: DataSource) {}

  async returnProduct(params: {
    oid: number
    invoiceId: number
    time: number
    money: number
    description?: string
  }) {
    const { oid, invoiceId, time, money } = params
    const PREFIX = `InvoiceId=${invoiceId} refund failed`

    const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      // === 1. INVOICE: update ===
      const whereInvoice: FindOptionsWhere<Invoice> = {
        oid,
        id: invoiceId,
        status: In([InvoiceStatus.Debt, InvoiceStatus.Success]),
        paid: money, // phải hoàn trả đủ số tiền đã thanh toán
      }
      const setInvoice: { [P in keyof NoExtra<Partial<Invoice>>]: Invoice[P] | (() => string) } = {
        status: InvoiceStatus.Refund,
        debt: 0,
        paid: 0,
      }
      const invoiceUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Invoice)
        .where(whereInvoice)
        .set(setInvoice)
        .returning('*')
        .execute()
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`${PREFIX}: Update invoice failed`)
      }
      const invoice = Invoice.fromRaw(invoiceUpdateResult.raw[0])

      // === 2. INVOICE_ITEMS: query + CALCULATOR ===
      const debt = invoice.totalMoney - money
      invoice.invoiceItems = await manager.find(InvoiceItem, {
        where: { oid, invoiceId },
      })
      if (invoice.invoiceItems.length === 0) {
        throw new Error(`${PREFIX}: invoiceItems.length = 0`)
      }
      const invoiceItemsBatch = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.Batch)
      const invoiceItemsProductHasManageQuantity = invoice.invoiceItems.filter((i) => {
        return [InvoiceItemType.ProductHasManageQuantity, InvoiceItemType.Batch].includes(i.type)
      })
      const invoiceItemsProductNoMangeQuantity = invoice.invoiceItems.filter((i) => {
        return i.type === InvoiceItemType.ProductNoManageQuantity
      })

      const productIdMap: Record<
        string,
        {
          productId: number
          quantityReturn: number
          costAmountReturn: number
          openQuantity: number
          openCostAmount: number
        }
      > = {}
      for (let i = 0; i < invoiceItemsProductHasManageQuantity.length; i++) {
        const { productId, quantity, costAmount } = invoiceItemsProductHasManageQuantity[i]
        if (!productIdMap[productId]) {
          productIdMap[productId] = {
            productId,
            quantityReturn: 0,
            costAmountReturn: 0,
            openQuantity: 0,
            openCostAmount: 0,
          }
        }
        productIdMap[productId].quantityReturn += quantity
        productIdMap[productId].costAmountReturn += costAmount
      }

      const batchIdMap: Record<
        string,
        {
          batchId: number
          productId: number
          quantityReturn: number
          openQuantity: number
        }
      > = {}
      for (let i = 0; i < invoiceItemsBatch.length; i++) {
        const { batchId, productId, quantity } = invoiceItemsBatch[i]
        if (!batchIdMap[batchId]) {
          batchIdMap[batchId] = {
            batchId,
            productId,
            quantityReturn: 0,
            openQuantity: 0,
          }
        }
        batchIdMap[batchId].quantityReturn += quantity
      }

      let batchList: Batch[] = []
      let productList: Product[] = []
      let productMap: Record<string, Product> = {}

      // === 3. CUSTOMER: refund debt and query
      // Nếu không có nợ thì không cập nhật nợ
      let customer: Customer
      if (debt > 0) {
        const whereCustomer: FindOptionsWhere<Customer> = { id: invoice.customerId }
        const customerUpdateResult: UpdateResult = await manager
          .createQueryBuilder()
          .update(Customer)
          .where(whereCustomer)
          .set({
            debt: () => `debt - ${debt}`,
          })
          .returning('*')
          .execute()
        if (customerUpdateResult.affected !== 1) {
          throw new Error(`${PREFIX}: CustomerId: ${invoice.customerId} update failed`)
        }
        customer = Customer.fromRaw(customerUpdateResult.raw[0])
      }

      // === 4. INSERT CUSTOMER_PAYMENT ===
      // Trường hợp đơn 0 đồng mà hoàn trả thì cũng ko cần ghi lịch sử luôn
      if (debt > 0 || money > 0) {
        if (!customer) {
          customer = await manager.findOneBy(Customer, { oid, id: invoice.customerId })
        }
        const customerCloseDebt = customer.debt
        const customerOpenDebt = customerCloseDebt + debt

        const customerPaymentInsert: CustomerPaymentInsertType = {
          oid,
          customerId: invoice.customerId,
          voucherId: invoiceId,
          voucherType: VoucherType.Invoice,
          createdAt: time,
          paymentType: PaymentType.ReceiveRefund,
          paid: -money,
          debit: -debt,
          openDebt: customerOpenDebt,
          closeDebt: customerCloseDebt,
          note: '',
          description: params.description || '',
        }
        const customerPaymentInsertResult = await manager.insert(
          CustomerPayment,
          customerPaymentInsert
        )

        const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
        if (!customerPaymentId) {
          throw new Error(
            `${PREFIX}: Insert CustomerPayment failed:` +
              ` ${JSON.stringify(customerPaymentInsertResult)}`
          )
        }
      }

      // === 5. PRODUCT: update quantity ===
      if (invoiceItemsProductHasManageQuantity.length) {
        const productQuantityList = Object.values(productIdMap)
        const productUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE    "Product" "product"
          SET       "quantity" = "product"."quantity" + temp."quantityReturn",
                    "costAmount" = "product"."costAmount" + temp."costAmountReturn"
          FROM (VALUES ` +
            productQuantityList
              .map((i) => {
                return `(${i.productId}, ${i.quantityReturn}, ${i.costAmountReturn})`
              })
              .join(', ') +
            `   ) AS temp("productId", "quantityReturn", "costAmountReturn")
          WHERE     "product"."id" = temp."productId" 
                AND "product"."oid" = ${oid}
                AND "product"."hasManageQuantity" = 1 
          RETURNING "product".*;        
          `
        )
        if (productUpdateResult[1] != productQuantityList.length) {
          // * Product chuyển từ có quản lý sang không quản lý => ko update => chấp nhận length khác nhau
          // * Product chuyển từ không quản lý sang có quản lý => ko update do đã filter từ invoiceItem
          // throw new Error(`${PREFIX}: Update Product, affected = ${productUpdateResult[1]}`)
        }
        productList = Product.fromRaws(productUpdateResult[0])
        productMap = arrayToKeyValue(productList, 'id')
      }

      // === 6. BATCH: update quantity ===
      if (invoiceItemsBatch.length) {
        // product nào không cập nhật số lượng nữa thì cũng không cập nhật batch luôn
        const batchQuantityList = Object.values(batchIdMap).filter((i) => productMap[i.productId])
        const batchUpdateResult: [any[], number] = await manager.query(
          `
          UPDATE    "Batch" "batch"
          SET       "quantity" = "batch"."quantity" + temp."quantityReturn"
          FROM (VALUES ` +
            batchQuantityList
              .map((i) => {
                return `(${i.batchId}, ${i.quantityReturn})`
              })
              .join(', ') +
            `   ) AS temp("batchId", "quantityReturn")
          WHERE     "batch"."id" = temp."batchId" AND "batch"."oid" = ${oid}
          RETURNING "batch".*;        
          `
        )
        if (batchUpdateResult[1] != batchQuantityList.length) {
          throw new Error(`${PREFIX}: Update Batch, affected = ${batchUpdateResult[1]}`)
        }
        batchList = Batch.fromRaws(batchUpdateResult[0])
      }

      // === 7. CALCULATOR: số lượng ban đầu của product và batch ===
      productList.forEach((i) => {
        const currentMap = productIdMap[i.id]
        currentMap.openQuantity = i.quantity - currentMap.quantityReturn
        currentMap.openCostAmount = i.costAmount - currentMap.costAmountReturn
      })
      batchList.forEach((i) => {
        const currentMap = batchIdMap[i.id]
        currentMap.openQuantity = i.quantity - currentMap.quantityReturn
      })

      // === 8. PRODUCT_MOVEMENT: insert ===
      const productMovementsDraft: ProductMovementInsertType[] = []

      invoiceItemsProductHasManageQuantity.forEach((invoiceItem) => {
        const currentProductMap = productIdMap[invoiceItem.productId]
        // vẫn có thể currentProductMap null vì Product chuyển từ có quản lý sang không quản lý số lượng
        const draft: ProductMovementInsertType = {
          oid,
          productId: invoiceItem.productId,
          voucherId: invoiceId,
          contactId: invoice.customerId,
          createdAt: time,
          voucherType: VoucherType.Invoice,
          isRefund: 1,
          unitRate: invoiceItem.unitRate,
          expectedPrice: invoiceItem.expectedPrice,
          actualPrice: invoiceItem.actualPrice,
          openQuantity: currentProductMap ? currentProductMap.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
          quantity: invoiceItem.quantity,
          closeQuantity: currentProductMap
            ? currentProductMap.openQuantity + invoiceItem.quantity
            : 0,
          openCostAmount: currentProductMap ? currentProductMap.openCostAmount : 0,
          costAmount: invoiceItem.costAmount,
          closeCostAmount: currentProductMap
            ? currentProductMap.openCostAmount + invoiceItem.costAmount
            : 0,
        }
        productMovementsDraft.push(draft)
        // sau khi lấy rồi cần cập nhật currentProductMap vì 1 sản phẩm có thể bán 2 số lượng với 2 giá khác nhau
        // trường hợp noHasManageQuantity thì bỏ qua
        if (currentProductMap) {
          currentProductMap.openQuantity = draft.closeQuantity // gán lại số lượng ban đầu vì draft đã lấy
          currentProductMap.openCostAmount = draft.closeCostAmount // gán lại số lượng ban đầu vì draft đã lấy
        }
      })

      invoiceItemsProductNoMangeQuantity.forEach((invoiceItem) => {
        const draft: ProductMovementInsertType = {
          oid,
          productId: invoiceItem.productId,
          voucherId: invoiceId,
          contactId: invoice.customerId,
          createdAt: time,
          voucherType: VoucherType.Invoice,
          isRefund: 1,
          unitRate: invoiceItem.unitRate,
          actualPrice: invoiceItem.actualPrice,
          expectedPrice: invoiceItem.expectedPrice,
          openQuantity: 0,
          quantity: invoiceItem.quantity,
          closeQuantity: 0,
          openCostAmount: 0,
          costAmount: 0,
          closeCostAmount: 0,
        }
        productMovementsDraft.push(draft)
      })
      if (productMovementsDraft.length) {
        await manager.insert(ProductMovement, productMovementsDraft)
      }

      // === 9. BATCH_MOVEMENT: insert ===
      if (invoiceItemsBatch.length) {
        const batchMovementsDraft = invoiceItemsBatch.map((invoiceItem) => {
          const currentProductMap = productIdMap[invoiceItem.productId]
          // vẫn có thể currentProductMap null vì Product chuyển từ có quản lý sang không quản lý số lượng
          const currentBatchMap = batchIdMap[invoiceItem.batchId]
          const draft: BatchMovementInsertType = {
            oid,
            batchId: invoiceItem.batchId,
            productId: invoiceItem.productId,
            voucherId: invoiceId,
            contactId: invoice.customerId,
            createdAt: time,
            voucherType: VoucherType.Invoice,
            isRefund: 1,
            unitRate: invoiceItem.unitRate,
            actualPrice: invoiceItem.actualPrice,
            expectedPrice: invoiceItem.expectedPrice,
            openQuantity: currentProductMap ? currentBatchMap.openQuantity : 0, // quantity đã được trả đúng số lượng ban đầu ở trên
            quantity: invoiceItem.quantity,
            closeQuantity: currentProductMap
              ? currentBatchMap.openQuantity + invoiceItem.quantity
              : 0,
          }
          if (currentProductMap) {
            currentBatchMap.openQuantity = draft.closeQuantity
          }
          return draft
        })
        await manager.insert(BatchMovement, batchMovementsDraft)
      }

      const { invoiceItems, ...invoiceBasic } = invoice
      return { invoiceBasic, invoiceItems, customer, productList, batchList }
    })

    return transaction
  }
}

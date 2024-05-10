import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { sleep } from '../../_libs/common/helpers/function.helper'
import { randomFullName } from '../../_libs/common/helpers/random.helper'
import { InvoiceStatus } from '../../_libs/database/common/variable'
import { Customer, Distributor, Invoice, Receipt } from '../../_libs/database/entities'

@ApiTags('Test')
@ApiBearerAuth('access-token')
@Controller('test')
export class TestApi {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) {}

  @Get('raw_query')
  async rawQuery() {
    const result = await this.manager.query(`
            UPDATE  "ProductBatch" "productBatch" 
            SET     "quantity" = "quantity" - "sri"."sumQuantity"
            FROM    ( 
                    SELECT "referenceId", SUM("quantity") as "sumQuantity" 
                        FROM "InvoiceItem" "invoiceItem"
                        GROUP BY "referenceId"
                    ) AS sri 
            WHERE   "productBatch"."id" = "sri"."referenceId"
                        AND "productBatch"."oid" = 1
            RETURNING *
        `)
    console.log('🚀 ~ file: test-sql.api.ts:26 ~ TestApi ~ rawQuery ~ result:', result)
    // result = {
    //     fieldCount: 0,
    //     affectedRows: 26,
    //     insertId: 0,
    //     info: 'Rows matched: 26  Changed: 26  Warnings: 0',
    //     serverStatus: 34,
    //     warningStatus: 0,
    //     changedRows: 26,
    // }
    return result
  }

  @Get('update_calculator')
  async update_calculator() {
    const money = 11
    const invoiceUpdateResult = await this.manager.update(
      Invoice,
      { id: 226 },
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
    console.log(
      '🚀 ~ file: test-sql.api.ts:57 ~ TestApi ~ update_calculator ~ invoiceUpdateResult:',
      invoiceUpdateResult
    )
    return invoiceUpdateResult
  }

  @Get('update_query_join')
  async update_query_join() {
    const result = await this.manager.query(`
            UPDATE product_movement LEFT JOIN product_batch
                ON product_movement.product_batch_id = product_batch.id
            SET product_movement.open_quantity = product_batch.quantity,
                product_movement.close_quantity = product_batch.quantity + product_movement.number,
                product_batch.quantity = product_batch.quantity + product_movement.number
            WHERE product_movement.reference_id = 1 AND product_batch.oid = 1
        `)
    // result = {
    //     fieldCount: 0,
    //     affectedRows: 26,
    //     insertId: 0,
    //     info: 'Rows matched: 26  Changed: 26  Warnings: 0',
    //     serverStatus: 34,
    //     warningStatus: 0,
    //     changedRows: 26,
    // }
    return result
  }

  @Get('insert')
  async insert() {
    // const purchaseEntity = this.manager.create<Receipt>(Receipt, [
    //     {
    //         oid: 1,
    //         distributorId: 12,
    //         paymentStatus: PaymentStatus.Waiting,
    //         createTime: 12313,
    //         totalMoney: 123,
    //         debt: 123123,
    //     },
    // ])
    // const result = await this.manager.insert(Receipt, purchaseEntity)
    // result = {
    //     identifiers: [{ id: 6 }],
    //     generatedMaps: [
    //         {
    //             id: 6,
    //             paymentStatus: 1,
    //             totalMoney: '123',
    //             debt: 123123,
    //         },
    //     ],
    //     raw: [
    //         {
    //             id: 6,
    //             payment_status: 1,
    //             revenue: '123',
    //             debt: 123123,
    //         },
    //     ],
    // }
    // return result
  }

  @Get('query-builder')
  async queryBuilder() {
    // const result = await this.manager.createQueryBuilder('arrival', 'arrival')
    //     .leftJoinAndSelect('arrival.customer', 'customer', 'arrival.customer_id = customer.id')
    //     .where('arrival.id = :arrivalId', { arrivalId: 1 })
    //     .getOne()
    // relations với 1 bảng không quy định trong entity phải dùng Raw
    // const result = await this.arrivalRepository
    //     .createQueryBuilder('arrival')
    //     .leftJoinAndSelect('distributor', 'distributor', 'arrival.customer_id = distributor.id')
    //     .select(['arrival.id as id', 'distributor.full_name as fullName'])
    //     .where('arrival.id = :arrivalId', { arrivalId: 1 })
    //     .getRawOne()
    // const result = await this.manager.createQueryBuilder(Arrival, 'arrival')
    //     .leftJoinAndSelect('arrival.customer', 'customer')
    //     .leftJoinAndSelect('arrival.invoices', 'invoice')
    //     .leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
    //     .leftJoinAndSelect(
    //         'invoiceItem.procedure',
    //         'procedure',
    //         'invoiceItem.type = :typeProcedure',
    //         { typeProcedure: InvoiceItemType.Procedure }
    //     )
    //     .leftJoinAndSelect(
    //         'invoiceItem.productBatch',
    //         'productBatch',
    //         'invoiceItem.type = :typeProductBatch',
    //         { typeProductBatch: InvoiceItemType.ProductBatch }
    //     )
    //     .where('arrival.id = :id', { id: 1 })
    //     .getOne()
    // return result
  }

  @Get('transaction_READ_UNCOMMITTED')
  async transaction_READ_UNCOMMITTED() {
    const startTime = Date.now()
    const [customerRoot] = await this.manager.find(Customer, { where: { id: 1 } })
    const result = await Promise.allSettled([
      this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        await sleep(1000)
        await manager.update(Customer, { id: 1, fullName: '444' }, { fullName: '666' })
        await sleep(3000)
      }),
      this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        await manager.update(Customer, { id: 1 }, { fullName: '555' })
        await sleep(2000)
      }),
    ])
    const endTime = Date.now()
    const [customerAfter] = await this.manager.find(Customer, { where: { id: 1 } })
    return {
      customerRoot: customerRoot.fullName,
      result,
      customerAfter: customerAfter.fullName,
      time: endTime - startTime,
    }
  }

  @Get('transaction_REPEATABLE_READ')
  async transaction_REPEATABLE_READ() {
    const [receiptRoot] = await this.manager.find(Receipt, { where: { id: 1 } })
    const startTime = Date.now()
    const result = await Promise.allSettled([
      this.dataSource.transaction('REPEATABLE READ', async (manager) => {
        await sleep(1000)
        // await manager.update(Receipt, { id: 1 }, { note: randomFullName() })
        await manager.update(Distributor, { id: 156 }, { fullName: randomFullName() })
        await sleep(3000)
      }),
      this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const [receipt] = await manager.find(Receipt, {
          where: { id: 1, oid: 1 },
          relations: { receiptItems: true, distributor: true },
          relationLoadStrategy: 'join',
        })
        await sleep(2000)
        return receipt.note
      }),
    ])
    const endTime = Date.now()
    const [receiptAfter] = await this.manager.find(Receipt, { where: { id: 1 } })
    return {
      receiptRoot: receiptRoot.note,
      result,
      receiptAfter: receiptAfter.note,
      time: endTime - startTime,
    }
  }

  @Get('transaction_SERIALIZABLE')
  async transaction_SERIALIZABLE() {
    const startTime = Date.now()
    const [customerRoot] = await this.manager.find(Customer, { where: { id: 1 } })
    const result = await Promise.allSettled([
      this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        await sleep(1000)
        await manager.update(Customer, { id: 1 }, { fullName: randomFullName() })
        await sleep(3000)
      }),
      this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const [customer] = await manager.find(Customer, { where: { id: 1 } })
        await sleep(2000)
        return customer.fullName
      }),
    ])
    const endTime = Date.now()
    const [customerAfter] = await this.manager.find(Customer, { where: { id: 1 } })
    return {
      customerRoot: customerRoot.fullName,
      result,
      customerAfter: customerAfter.fullName,
      time: endTime - startTime,
    }
  }

  @Get('query-transaction')
  // 1. Transaction không block hàm find, find hoạt động bình thường
  async query_transaction() {
    const [customerRoot] = await this.manager.find(Customer, { where: { id: 1 } })
    const startTime = Date.now()
    const result = await Promise.allSettled([
      this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        // await sleep(1000)
        manager.find(Customer, { where: { id: 1 } })
        // manager.update(Customer, { id: 1 }, { fullName: randomFullName() })
        await sleep(3000)
        // throw new Error('some error')
      }),
      (async () => {
        await sleep(2000)
        await this.manager.update(Customer, { id: 1 }, { fullName: new Date().toISOString() })
        await sleep(1000)
      })(),
      // (async () => {
      //     await sleep(1000)
      //     const [customer] = await this.manager.find(Customer, { where: { id: 1 } })
      //     await sleep(1000)
      //     return customer.fullName
      // })(),
      // (async () => {
      //     await sleep(5000) // cái này thì luôn đúng vì sleep 5s, thằng transaction thực hiện xong rôi
      //     const [customer] = await this.manager.find(Customer, { where: { id: 1 } })
      //     await sleep(1000)
      //     return customer.fullName
      // })(),
    ])
    const endTime = Date.now()
    const [customerAfter] = await this.manager.find(Customer, { where: { id: 1 } })

    return {
      customerRoot: customerRoot.fullName,
      result,
      customerAfter: customerAfter.fullName,
      time: endTime - startTime,
    }
  }

  @Get('transaction-DEADLOCK')
  async transaction_DEADLOCK() {
    const result = await Promise.allSettled([
      this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const [customer] = await manager.find(Customer, { where: { id: 1 } })
        await sleep(2000)
        await manager.update(Customer, { id: 1 }, { fullName: randomFullName() })
      }),
      this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const [customer] = await manager.find(Customer, { where: { id: 1 } })
        await sleep(2000)
        await manager.update(Customer, { id: 1 }, { fullName: randomFullName() })
      }),
    ])
    return { result }
  }

  @Get('transaction-DEADLOCK_READ_UNCOMMITTED')
  async transaction_DEADLOCK_READ_UNCOMMITTED() {
    const result = await Promise.allSettled([
      this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        await manager.update(Customer, { id: 1 }, { fullName: randomFullName() })
        await sleep(2000)
        await manager.update(Customer, { id: 2 }, { fullName: randomFullName() })
      }),
      this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
        await manager.update(Customer, { id: 2 }, { fullName: randomFullName() })
        await sleep(2000)
        await manager.update(Customer, { id: 1 }, { fullName: randomFullName() })
      }),
    ])
    return { result }
  }
}

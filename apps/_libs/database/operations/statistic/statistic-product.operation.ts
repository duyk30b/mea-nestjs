import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'

@Injectable()
export class StatisticProductOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) { }

  async sumWarehouse(oid: number) {
    const data: { warehouseId: number; sumCostAmount: string; sumRetailAmount: string }[] =
      await this.manager.query(`
        SELECT 
            "Batch"."warehouseId",
            SUM("Batch"."costPrice" * "Batch"."quantity") AS "sumCostAmount",
            SUM("Batch"."quantity" * "Product"."retailPrice") AS "sumRetailAmount"
        FROM "Batch"
        JOIN "Product" ON "Batch"."productId" = "Product"."id"
        WHERE "Batch"."oid" = ${oid}
        GROUP BY "Batch"."warehouseId";
    `)
    return data.map((i) => ({
      warehouseId: i.warehouseId,
      sumCostAmount: Number(i.sumCostAmount),
      sumRetailAmount: Number(i.sumRetailAmount),
    }))
  }

  async topProductHighMoney(options: {
    oid: number
    limit: number
    orderBy: 'quantity' | 'costAmount' | 'retailAmount'
  }) {
    const { oid, limit, orderBy } = options
    const data: any[] = await this.manager.query(`
        SELECT 
            "Product".*,
            ("Product"."retailPrice" * "Product"."quantity") AS "retailAmount",
            SUM("Batch"."quantity" * "Batch"."costPrice") AS "costAmount"
        FROM "Product"
        JOIN "Batch" ON "Product"."id" = "Batch"."productId"
        WHERE "Product"."oid" = ${oid}
        GROUP BY "Product"."id"
        ORDER BY "${orderBy}" DESC
        LIMIT ${limit};
    `)
    return data.map((i) => ({
      ...i,
      retailAmount: Number(i.retailAmount),
      costAmount: Number(i.costAmount),
    }))
  }
}

import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { Batch } from '../entities'
import {
  BatchInsertType,
  BatchRelationType,
  BatchSortType,
  BatchUpdateType,
} from '../entities/batch.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class BatchManager extends _PostgreSqlManager<
  Batch,
  BatchRelationType,
  BatchInsertType,
  BatchUpdateType,
  BatchSortType
> {
  constructor() {
    super(Batch)
  }

  async changeQuantity(options: {
    manager: EntityManager
    oid: number
    changeList: { batchId: number; quantity: number }[]
  }) {
    const { manager, oid, changeList } = options
    let batchModifiedList: Batch[] = []
    if (changeList.length) {
      const productModifiedRaw: [any[], number] = await manager.query(
        `
        UPDATE "Batch" "batch"
        SET "quantity" = "batch"."quantity" + temp."quantity"
        FROM (VALUES `
        + changeList.map((calc) => `(${calc.batchId}, ${calc.quantity})`).join(', ')
        + `   ) AS temp("batchId", "quantity")
        WHERE   "batch"."id" = temp."batchId" 
        AND "batch"."oid" = ${oid}
        RETURNING "batch".*;        
        `
      )
      if (productModifiedRaw[0].length != changeList.length) {
        throw new Error(`Update Batch failed, ${JSON.stringify(productModifiedRaw)}`)
      }
      batchModifiedList = Batch.fromRaws(productModifiedRaw[0])
    }

    return batchModifiedList
  }
}

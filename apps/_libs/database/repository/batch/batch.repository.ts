import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Batch } from '../../entities'
import { BatchInsertType, BatchUpdateType } from '../../entities/batch.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class BatchRepository extends PostgreSqlRepository<
  Batch,
  { [P in 'id' | 'expiryDate']?: 'ASC' | 'DESC' },
  { [P in 'product']?: boolean },
  BatchInsertType,
  BatchUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Batch) private batchRepository: Repository<Batch>
  ) {
    super(batchRepository)
  }

  // async delete(oid: number, id: number) {
  //     return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
  //         const numberMovement = await manager.count(ProductMovement, {
  //             where: { productBatchId: id, oid },
  //         })
  //         if (numberMovement > 0) {
  //             // nếu đã có giao dịch thì chỉ có thể xóa mềm
  //             const updateResult = await manager.update(
  //                 Batch,
  //                 {
  //                     oid,
  //                     id,
  //                     quantity: 0,
  //                 },
  //                 { deletedAt: Date.now() }
  //             )
  //             if (updateResult.affected !== 1) {
  //                 throw new Error('Xóa lô hàng thất bại')
  //             }
  //         } else {
  //             // nếu chưa có giao dịch thì xóa cứng
  //             const deleteResult = await manager.delete(Batch, {
  //                 oid,
  //                 id,
  //                 quantity: 0,
  //             })
  //             if (deleteResult.affected !== 1) {
  //                 throw new Error('Xóa lô hàng thất bại')
  //             }
  //         }
  //     })
  // }
}

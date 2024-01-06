import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { Receipt } from '../../entities'
import { BaseSqlRepository } from '../base-sql.repository'

@Injectable()
export class ReceiptRepository extends BaseSqlRepository<
    Receipt,
    { [P in 'id' | 'distributorId']?: 'ASC' | 'DESC' },
    { [P in 'distributor' | 'distributorPayments']?: boolean } & {
        receiptItems?: { productBatch?: { product?: boolean } } | false
    }
> {
    constructor(
        private dataSource: DataSource,
        @InjectEntityManager() private manager: EntityManager,
        @InjectRepository(Receipt) private receiptRepository: Repository<Receipt>
    ) {
        super(receiptRepository)
    }

    async queryOneBy(
        condition: { id: number; oid: number },
        relation?: {
            distributor?: boolean
            distributorPayments?: boolean
            receiptItems?: { productBatch?: boolean }
        }
    ): Promise<Receipt> {
        let query = this.manager
            .createQueryBuilder(Receipt, 'receipt')
            .where('receipt.id = :id', { id: condition.id })
            .andWhere('receipt.oid = :oid', { oid: condition.oid })

        if (relation?.distributor) query = query.leftJoinAndSelect('receipt.distributor', 'distributor')
        if (relation?.distributorPayments) {
            query = query.leftJoinAndSelect('invoice.distributorPayments', 'distributorPayment')
        }
        if (relation?.receiptItems) query = query.leftJoinAndSelect('receipt.receiptItems', 'receiptItem')
        if (relation?.receiptItems?.productBatch) {
            query = query
                .leftJoinAndSelect('receiptItem.productBatch', 'productBatch')
                .leftJoinAndSelect('productBatch.product', 'product')
        }

        const receipt = await query.getOne()
        return receipt
    }
}

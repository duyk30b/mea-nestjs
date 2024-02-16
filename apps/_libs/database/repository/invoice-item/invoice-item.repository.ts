import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { InvoiceItemType } from '../../common/variable'
import { InvoiceItem } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class InvoiceItemRepository extends PostgreSqlRepository<
  InvoiceItem,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'customer']?: boolean }
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>
  ) {
    super(invoiceItemRepository)
  }

  getQueryBuilder(
    condition: { id?: number; referenceId?: number; type?: InvoiceItemType; oid?: number } = {}
  ) {
    let query = this.manager.createQueryBuilder(InvoiceItem, 'invoiceItem')
    if (condition.id != null) {
      query = query.andWhere('invoiceItem.id = :id', { id: condition.id })
    }
    if (condition.referenceId != null) {
      query = query.andWhere('invoiceItem.referenceId = :referenceId', {
        referenceId: condition.referenceId,
      })
    }
    if (condition.type != null) {
      query = query.andWhere('invoiceItem.type = :type', { type: condition.type })
    }
    if (condition.oid != null) {
      query = query.andWhere('invoiceItem.oid = :oid', { oid: condition.oid })
    }
    return query
  }
}

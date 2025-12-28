import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { OrganizationPayment } from '../entities'
import {
  OrganizationPaymentInsertType,
  OrganizationPaymentRelationType,
  OrganizationPaymentSortType,
  OrganizationPaymentUpdateType,
} from '../entities/organization-payment.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class OrganizationPaymentManager extends _PostgreSqlManager<
  OrganizationPayment,
  OrganizationPaymentRelationType,
  OrganizationPaymentInsertType,
  OrganizationPaymentUpdateType,
  OrganizationPaymentSortType
> {
  constructor() {
    super(OrganizationPayment)
  }
}

@Injectable()
export class OrganizationPaymentRepository extends _PostgreSqlRepository<
  OrganizationPayment,
  OrganizationPaymentRelationType,
  OrganizationPaymentInsertType,
  OrganizationPaymentUpdateType,
  OrganizationPaymentSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(OrganizationPayment)
    private organizationPaymentRepository: Repository<OrganizationPayment>
  ) {
    super(OrganizationPayment, organizationPaymentRepository)
  }
}

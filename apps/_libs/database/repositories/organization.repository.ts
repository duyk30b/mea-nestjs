import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Organization } from '../entities'
import {
  OrganizationInsertType,
  OrganizationRelationType,
  OrganizationSortType,
  OrganizationUpdateType,
} from '../entities/organization.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class OrganizationRepository extends _PostgreSqlRepository<
  Organization,
  OrganizationRelationType,
  OrganizationInsertType,
  OrganizationUpdateType,
  OrganizationSortType
> {
  constructor(
    @InjectRepository(Organization) private organizationRepository: Repository<Organization>
  ) {
    super(Organization, organizationRepository)
  }

  async updateDataVersion(
    oid: number,
    repository: { product: boolean; batch: boolean; customer: boolean }
  ) {
    const orgOrigin = await this.findOneById(oid)
    orgOrigin.dataVersionParse = JSON.parse(orgOrigin.dataVersion)

    const randomNumber = Math.floor(Math.random() * 1000)
    const organizationModified = await this.updateOne(
      { id: oid },
      {
        dataVersion: JSON.stringify({
          product: repository.product ? randomNumber : orgOrigin.dataVersionParse.product,
          batch: repository.batch ? randomNumber : orgOrigin.dataVersionParse.batch,
          customer: repository.customer ? randomNumber : orgOrigin.dataVersionParse.customer,
        }),
      }
    )
    return { organizationModified }
  }

  async updateAllDataVersion() {
    const randomNumber = Math.floor(Math.random() * 1000)
    const organization = await this.updateOne(
      {},
      {
        dataVersion: JSON.stringify({
          product: randomNumber,
          batch: randomNumber,
          customer: randomNumber,
        }),
      }
    )
    return organization
  }
}

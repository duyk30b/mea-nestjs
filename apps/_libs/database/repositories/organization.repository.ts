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

  async updateDataVersion(oid: number) {
    const randomNumber = Math.floor(Math.random() * 100)
    const organization = await this.updateAndReturnEntity(
      { id: oid },
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

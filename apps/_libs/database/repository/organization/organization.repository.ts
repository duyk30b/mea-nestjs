import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Organization } from '../../entities'
import {
  OrganizationInsertType,
  OrganizationRelationType,
  OrganizationSortType,
  OrganizationUpdateType,
} from '../../entities/organization.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class OrganizationRepository extends PostgreSqlRepository<
  Organization,
  { [P in keyof OrganizationSortType]?: 'ASC' | 'DESC' },
  { [P in keyof OrganizationRelationType]?: boolean },
  OrganizationInsertType,
  OrganizationUpdateType
> {
  constructor(
    @InjectRepository(Organization) private organizationRepository: Repository<Organization>
  ) {
    super(organizationRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<OrganizationInsertType>>(
    data: NoExtra<Partial<OrganizationInsertType>, X>
  ): Promise<Organization> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Organization.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends OrganizationInsertType>(
    data: NoExtra<OrganizationInsertType, X>
  ): Promise<Organization> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Organization.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<OrganizationUpdateType>>(
    condition: BaseCondition<Organization>,
    data: NoExtra<Partial<OrganizationUpdateType>, X>
  ): Promise<Organization[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Organization.fromRaws(raws)
  }
}

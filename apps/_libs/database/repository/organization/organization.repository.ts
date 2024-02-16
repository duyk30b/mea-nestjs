import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Organization, OrganizationSetting } from '../../entities'
import { OrganizationInsertType, OrganizationUpdateType } from '../../entities/organization.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class OrganizationRepository extends PostgreSqlRepository<
  Organization,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'users']?: boolean },
  OrganizationInsertType,
  OrganizationUpdateType
> {
  private dataMap: Record<string, Organization> = {}

  constructor(
    @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationSetting)
    private organizationSettingRepository: Repository<OrganizationSetting>
  ) {
    super(organizationRepository)
  }

  async getOneFromCache(id: number) {
    if (!this.dataMap[id]) {
      this.dataMap[id] = await this.findOneById(id)
    }
    return this.dataMap[id]
  }
}

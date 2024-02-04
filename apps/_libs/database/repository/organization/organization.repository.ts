import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Organization, OrganizationSetting } from '../../entities'
import { OrganizationSettingType } from '../../entities/organization-setting.entity'
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
  constructor(
    @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationSetting)
    private organizationSettingRepository: Repository<OrganizationSetting>
  ) {
    super(organizationRepository)
  }

  async getAllSetting(oid: number) {
    return await this.organizationSettingRepository.find({
      select: { type: true, data: true },
      where: { oid },
    })
  }

  async getSettings(oid: number, types: OrganizationSettingType[]) {
    return await this.organizationSettingRepository.find({
      select: { type: true, data: true },
      where: { oid, type: In(types) },
    })
  }

  async upsertSetting(oid: number, type: OrganizationSettingType, data: string) {
    const dto = this.organizationSettingRepository.create({ oid, type, data })
    return await this.organizationSettingRepository
      .createQueryBuilder()
      .insert()
      .into(OrganizationSetting)
      .values(dto)
      .orUpdate(['data'], ['oid', 'type'])
      .execute()
  }
}

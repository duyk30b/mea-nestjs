import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { OrganizationSetting } from '../../entities'
import {
  OrganizationSettingInsertType,
  OrganizationSettingUpdateType,
  ScreenSettingKey,
} from '../../entities/organization-setting.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class OrganizationSettingRepository extends PostgreSqlRepository<
  OrganizationSetting,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in keyof OrganizationSetting]?: never },
  OrganizationSettingInsertType,
  OrganizationSettingUpdateType
> {
  constructor(
    @InjectRepository(OrganizationSetting)
    private organizationSettingRepository: Repository<OrganizationSetting>
  ) {
    super(organizationSettingRepository)
  }

  async getAllSetting(oid: number) {
    return await this.organizationSettingRepository.find({
      select: { type: true, data: true },
      where: { oid },
    })
  }

  async getSettings(oid: number, types: ScreenSettingKey[]) {
    return await this.organizationSettingRepository.find({
      select: { type: true, data: true },
      where: { oid, type: In(types) },
    })
  }

  async upsertSetting(oid: number, type: ScreenSettingKey, data: string) {
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

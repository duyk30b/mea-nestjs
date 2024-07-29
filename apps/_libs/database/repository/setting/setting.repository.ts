import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Setting } from '../../entities'
import { SettingInsertType, SettingKey, SettingUpdateType } from '../../entities/setting.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class SettingRepository extends PostgreSqlRepository<
  Setting,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in keyof Setting]?: never },
  SettingInsertType,
  SettingUpdateType
> {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>
  ) {
    super(settingRepository)
  }

  async upsertSetting(options: { oid: number; key: SettingKey; data: string }) {
    const { oid, key, data } = options
    const dto = this.settingRepository.create({ oid, key, data })
    return await this.settingRepository
      .createQueryBuilder()
      .insert()
      .into(Setting)
      .values(dto)
      .orUpdate(['data'], ['oid', 'key'])
      .execute()
  }
}

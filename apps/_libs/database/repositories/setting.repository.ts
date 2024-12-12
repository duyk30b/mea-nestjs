import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Setting } from '../entities'
import { SettingInsertType, SettingKey, SettingRelationType, SettingSortType, SettingUpdateType } from '../entities/setting.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class SettingRepository extends _PostgreSqlRepository<
  Setting,
  SettingRelationType,
  SettingInsertType,
  SettingUpdateType,
  SettingSortType
> {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>
  ) {
    super(Setting, settingRepository)
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

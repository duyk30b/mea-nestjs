import { Injectable } from '@nestjs/common'
import { Setting } from '../entities'
import {
  SettingInsertType,
  SettingRelationType,
  SettingSortType,
  SettingUpdateType,
} from '../entities/setting.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class SettingManager extends _PostgreSqlManager<
  Setting,
  SettingRelationType,
  SettingInsertType,
  SettingUpdateType,
  SettingSortType
> {
  constructor() {
    super(Setting)
  }
}

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PrintSetting } from '../entities'
import {
  PrintSettingInsertType,
  PrintSettingRelationType,
  PrintSettingSortType,
  PrintSettingUpdateType,
} from '../entities/print-setting.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PrintSettingManager extends _PostgreSqlManager<
  PrintSetting,
  PrintSettingRelationType,
  PrintSettingInsertType,
  PrintSettingUpdateType,
  PrintSettingSortType
> {
  constructor() {
    super(PrintSetting)
  }
}

@Injectable()
export class PrintSettingRepository extends _PostgreSqlRepository<
  PrintSetting,
  PrintSettingRelationType,
  PrintSettingInsertType,
  PrintSettingUpdateType,
  PrintSettingSortType
> {
  constructor(
    @InjectRepository(PrintSetting)
    private printSettingRepository: Repository<PrintSetting>
  ) {
    super(PrintSetting, printSettingRepository)
  }
}

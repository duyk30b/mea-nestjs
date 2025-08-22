import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PrintHtmlSetting } from '../entities'
import {
  PrintHtmlSettingInsertType,
  PrintHtmlSettingRelationType,
  PrintHtmlSettingSortType,
  PrintHtmlSettingUpdateType,
} from '../entities/print-html-setting.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PrintHtmlSettingManager extends _PostgreSqlManager<
  PrintHtmlSetting,
  PrintHtmlSettingRelationType,
  PrintHtmlSettingInsertType,
  PrintHtmlSettingUpdateType,
  PrintHtmlSettingSortType
> {
  constructor() {
    super(PrintHtmlSetting)
  }
}

@Injectable()
export class PrintHtmlSettingRepository extends _PostgreSqlRepository<
  PrintHtmlSetting,
  PrintHtmlSettingRelationType,
  PrintHtmlSettingInsertType,
  PrintHtmlSettingUpdateType,
  PrintHtmlSettingSortType
> {
  constructor(
    @InjectRepository(PrintHtmlSetting)
    private printHtmlSettingRepository: Repository<PrintHtmlSetting>
  ) {
    super(PrintHtmlSetting, printHtmlSettingRepository)
  }
}

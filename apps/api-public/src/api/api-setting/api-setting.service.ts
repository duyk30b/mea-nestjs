import { CacheDataService } from '@libs/common/cache-data/cache-data.service'
import { BaseResponse } from '@libs/common/interceptor/transform-response.interceptor'
import { SettingKey } from '@libs/database/entities/setting.entity'
import { SettingRepository } from '@libs/database/repositories/setting.repository'
import { Injectable } from '@nestjs/common'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { SettingUpsertBody } from './request/setting-upsert.request'

@Injectable()
export class ApiSettingService {
  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly socketEmitService: SocketEmitService,
    private readonly settingRepository: SettingRepository
  ) { }

  async getMap(oid: number): Promise<BaseResponse> {
    const settingMap = await this.cacheDataService.getSettingMap(oid)
    return { data: { settingMap } }
  }

  async upsert(oid: number, key: SettingKey, body: SettingUpsertBody): Promise<BaseResponse> {
    const data = await this.settingRepository.upsertSetting({
      oid,
      key,
      data: body.data,
    })
    await this.cacheDataService.reloadSettingMap(oid)
    this.socketEmitService.settingReload(oid)
    return { data }
  }
}

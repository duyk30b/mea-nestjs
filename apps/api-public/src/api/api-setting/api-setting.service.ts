import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { SettingKey } from '../../../../_libs/database/entities/setting.entity'
import { SettingRepository } from '../../../../_libs/database/repository/setting/setting.repository'
import { CacheDataService } from '../../../../_libs/transporter/cache-manager/cache-data.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { SettingUpsertBody } from './request/setting-upsert.request'

@Injectable()
export class ApiSettingService {
  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly socketEmitService: SocketEmitService,
    private readonly settingRepository: SettingRepository
  ) {}

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
    this.cacheDataService.reloadSettingMap(oid)
    this.socketEmitService.organizationSettingReload(oid)
    return { data }
  }
}

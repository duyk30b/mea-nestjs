import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { SettingKey } from '../../../../_libs/database/entities/setting.entity'
import { SettingRepository } from '../../../../_libs/database/repository/setting/setting.repository'
import { GoogleDriverService } from '../../../../_libs/transporter/google-driver/google-driver.service'
import { SocketEmitService } from '../../socket/socket-emit.service'

@Injectable()
export class ApiSettingGoogleDriverService {
  constructor(
    private readonly googleDriverService: GoogleDriverService,
    private readonly cacheDataService: CacheDataService,
    private readonly socketEmitService: SocketEmitService,
    private readonly settingRepository: SettingRepository
  ) { }

  async getAuthUrl(options: { state: string }) {
    const { url } = await this.googleDriverService.getAuthUrl({ state: options.state })
    return { data: { url } }
  }

  async logout(oid: number) {
    const setting = await this.settingRepository.findOneBy({
      key: SettingKey.GOOGLE_DRIVER,
      oid,
    })
    if (!setting) return
    const { email } = JSON.parse(setting.data)
    await this.googleDriverService.logout(email)
    await this.settingRepository.delete({ id: setting.id })
    await this.cacheDataService.reloadSettingMap(oid)
    return { data: true }
  }

  async loginCallback(query: { code: string; state: string; scope: string }) {
    const { oid, email, refreshToken } = await this.googleDriverService.loginCallback(query)
    await this.settingRepository.upsertSetting({
      oid,
      key: SettingKey.GOOGLE_DRIVER,
      data: JSON.stringify({ oid, email, refreshToken }),
    })
    await this.cacheDataService.reloadSettingMap(oid)
    this.socketEmitService.settingReload(oid)
  }

  async getAllAccounts() {
    const data = await this.settingRepository.findManyBy({
      key: SettingKey.GOOGLE_DRIVER,
    })
    return { data: data.map((i) => JSON.parse(i.data)) }
  }

  async getAllFolders(email: string) {
    const data = await this.googleDriverService.getAllFolders(email)
    return { data }
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { arrayToKeyArray } from '../../../../_libs/common/helpers/object.helper'
import { ImageHost, ImageInsertType } from '../../../../_libs/database/entities/image.entity'
import { SettingKey } from '../../../../_libs/database/entities/setting.entity'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { SettingRepository } from '../../../../_libs/database/repositories/setting.repository'
import { GoogleDriverService } from '../../../../_libs/transporter/google-driver/google-driver.service'

@Injectable()
export class ImageManagerService implements OnModuleInit {
  private logger = new Logger(ImageManagerService.name)

  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly googleDriverService: GoogleDriverService,
    private readonly cacheDataService: CacheDataService,
    private readonly settingRepository: SettingRepository
  ) { }

  async onModuleInit() {
    try {
      const settingList = await this.settingRepository.findManyBy({ key: SettingKey.GOOGLE_DRIVER })
      settingList.forEach((setting) => {
        const data = setting.data ? JSON.parse(setting.data) : {}
        if (!data.email || !data.refreshToken) return
        this.googleDriverService.setCache(data.email, {
          rootFolderId: '',
          refreshToken: data.refreshToken,
          defaultFolderId: '',
          defaultFolderName: '',
        })
      })
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  async changeImageList(options: {
    oid: number
    customerId: number
    imageIdsOld: number[]
    imageIdsKeep: number[]
    files: FileUploadDto[]
    filesPosition: number[]
  }) {
    const { oid, customerId, imageIdsKeep, imageIdsOld, files, filesPosition } = options

    const imageOldList = imageIdsOld.length
      ? await this.imageRepository.findManyByIds(imageIdsOld)
      : []
    const imageRemoveList = imageOldList.filter((i) => !imageIdsKeep.includes(i.id))
    // tách các imageRemove ra làm nhiều nhóm, vì có thể mỗi image lại được quản lý bởi email khác nhau
    const imageRemoveMapList = arrayToKeyArray(imageRemoveList, 'hostAccount')

    const email = await this.cacheDataService.getEmailGoogleDriver(oid)

    const [imageHostInsertList, ...imageHostTrashResponse] = await Promise.all([
      this.googleDriverService.uploadMultipleFiles({
        files,
        email,
        oid,
        customerId,
      }),
      ...Object.entries(imageRemoveMapList).map(([curEmail, imageList]) => {
        return this.googleDriverService.trashMultipleFiles({
          oid,
          email: curEmail,
          fileIds: imageList.map((i) => i.hostId),
        })
      }),
    ])

    const imageInsertList: ImageInsertType[] = imageHostInsertList.map((i, index) => {
      const draft: ImageInsertType = {
        oid,
        customerId,
        name: i.name,
        size: Number(i.size),
        mimeType: i.mimeType,
        hostType: ImageHost.GoogleDriver,
        hostAccount: email,
        hostId: i.id,
      }
      return draft
    })
    const imageHostTrashSuccess = imageHostTrashResponse.map((i) => i.success).flat()
    const imageHostTrashFailed = imageHostTrashResponse.map((i) => i.failed).flat()
    const imageIdsRemoveSuccess = imageRemoveList
      .filter((i) => imageHostTrashSuccess.includes(i.hostId))
      .map((i) => i.id)
    const imageIdsRemoveFailed = imageRemoveList
      .filter((i) => imageHostTrashFailed.includes(i.hostId))
      .map((i) => i.id)

    const [imageIdsNew] = await Promise.all([
      this.imageRepository.insertManyFullField(imageInsertList),
      imageIdsRemoveSuccess.length
        ? this.imageRepository.delete({ id: { IN: imageIdsRemoveSuccess } })
        : null,
      imageIdsRemoveFailed.length
        ? this.imageRepository.update({ id: { IN: imageIdsRemoveFailed } }, { waitDelete: 1 })
        : null,
    ])

    // sắp xếp sao cho đúng vị trí
    const imageIdsUpdate = [...imageIdsKeep]
    filesPosition.sort((a, b) => (a < b ? -1 : 1))
    for (let i = 0; i < filesPosition.length; i++) {
      imageIdsUpdate.splice(filesPosition[i], 0, imageIdsNew[i])
    }

    return imageIdsUpdate
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ESArray } from '../../../../_libs/common/helpers'
import Image, {
  ImageHostType,
  ImageInsertType,
  ImageInteractType,
} from '../../../../_libs/database/entities/image.entity'
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

  async changeGoogleDriverImageList(options: {
    oid: number
    ticketId: number
    customerId: number
    imageIdsOld: number[]
    imageIdsKeep: number[]
    files: FileUploadDto[]
    filesPosition: number[]
  }) {
    const { oid, ticketId, customerId, imageIdsKeep, imageIdsOld, files, filesPosition } = options

    const imageOldList = imageIdsOld.length
      ? await this.imageRepository.findManyByIds(imageIdsOld)
      : []
    const imageRemoveList = imageOldList.filter((i) => !imageIdsKeep.includes(i.id))
    // tách các imageRemove ra làm nhiều nhóm, vì có thể mỗi image lại được quản lý bởi email khác nhau
    const imageRemoveMapList = ESArray.arrayToKeyArray(imageRemoveList, 'hostAccount')

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
          fileIds: imageList.map((i) => i.externalId),
        })
      }),
    ])

    const imageInsertList: ImageInsertType[] = imageHostInsertList.map((i, index) => {
      const draft: ImageInsertType = {
        oid,
        name: i.name,
        size: Number(i.size),
        mimeType: i.mimeType,
        hostType: ImageHostType.GoogleDriver,
        hostAccount: email,
        externalId: i.id,
        externalUrl: '',
        imageInteractType: ImageInteractType.Customer,
        imageInteractId: customerId,
        ticketId,
        ticketItemId: 0,
        ticketItemChildId: 0,
      }
      return draft
    })
    const imageHostTrashSuccess = imageHostTrashResponse.map((i) => i.success).flat()
    const imageHostTrashFailed = imageHostTrashResponse.map((i) => i.failed).flat()
    const imageIdsRemoveSuccess = imageRemoveList
      .filter((i) => imageHostTrashSuccess.includes(i.externalId))
      .map((i) => i.id)
    const imageIdsRemoveFailed = imageRemoveList
      .filter((i) => imageHostTrashFailed.includes(i.externalId))
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

  async changeCloudinaryImageLink(options: {
    oid: number
    imageInteract: {
      imageInteractType: ImageInteractType // Loại hình ảnh
      imageInteractId: number // customerId, ticketId, organizationId
      ticketId: number
      ticketItemId: number
      ticketItemChildId: number
    }
    files: FileUploadDto[]
    externalUrlList: string[]
    imageIdsOld: number[] // ví dụ [1,4,3,20,21,12,7,3]
    imageIdsWait: number[] // ví dụ [1,4,3,0,0,0,12,7,3] // số 0 tương ứng với mỗi image mới chưa có ID
  }) {
    const { oid, imageInteract, imageIdsWait, imageIdsOld, files, externalUrlList } = options
    const imageIdsRemove = imageIdsOld.filter((i) => !imageIdsWait.includes(i))

    // chưa xử lý việc xóa ảnh thực sự trên host
    if (imageIdsRemove.length) {
      await this.imageRepository.updateAndReturnEntity(
        { oid, id: { IN: imageIdsRemove } },
        { waitDelete: 1 }
      )
    }

    const imageInsertList = externalUrlList.map((i) => {
      const insert: ImageInsertType = {
        oid,
        name: '',
        mimeType: '',
        size: 0,
        hostType: ImageHostType.Cloudinary,
        hostAccount: '',
        externalId: '',
        externalUrl: i,
        imageInteractType: imageInteract.imageInteractType,
        imageInteractId: imageInteract.imageInteractId,
        ticketId: imageInteract.ticketId,
        ticketItemId: imageInteract.ticketItemId,
        ticketItemChildId: imageInteract.ticketItemChildId,
      }
      return insert
    })
    const imageCreatedList = await this.imageRepository.insertManyAndReturnEntity(imageInsertList)

    // sắp xếp sao cho đúng vị trí
    const imageIdsNew = []
    for (let i = 0; i < imageIdsWait.length; i++) {
      if (imageIdsWait[i] !== 0) {
        imageIdsNew[i] = imageIdsWait[i]
      }
      if (imageIdsWait[i] === 0) {
        const imageCreated = imageCreatedList.shift() // push từng phần tư vào thôi
        imageIdsNew[i] = imageCreated.id
      }
    }

    return imageIdsNew
  }

  async removeImageGoogleDriver(oid: number, imageRemoveList: Image[]) {
    const imageMapAccount = ESArray.arrayToKeyArray(imageRemoveList, 'hostAccount')
    const imageHostTrashResponse = await Promise.all(
      Object.entries(imageMapAccount).map(([curEmail, curImageList]) => {
        return this.googleDriverService.trashMultipleFiles({
          oid,
          email: curEmail,
          fileIds: curImageList.map((i) => i.externalId),
        })
      })
    )
    const imageHostTrashSuccess = imageHostTrashResponse.map((i) => i.success).flat()
    const imageHostTrashFailed = imageHostTrashResponse.map((i) => i.failed).flat()
    const imageIdsRemoveSuccess = imageRemoveList
      .filter((i) => imageHostTrashSuccess.includes(i.externalId))
      .map((i) => i.id)
    const imageIdsRemoveFailed = imageRemoveList
      .filter((i) => imageHostTrashFailed.includes(i.externalId))
      .map((i) => i.id)

    if (imageIdsRemoveSuccess.length) {
      await this.imageRepository.delete({ id: { IN: imageIdsRemoveSuccess } })
    }
  }

  async removeImageCloudinary(oid: number, imageRemoveList: Image[]) {
    // tạm thời chưa làm gì cả
  }

  async removeImageList(options: { oid: number; idRemoveList: number[] }) {
    const { oid, idRemoveList } = options
    const imageWaitDeleteList = await this.imageRepository.updateAndReturnEntity(
      { oid, id: { IN: idRemoveList } },
      { waitDelete: 1 }
    )

    const imageCloudinaryWaitDelete = imageWaitDeleteList.filter((i) => {
      return i.hostType === ImageHostType.Cloudinary
    })
    const imageGoogleWaitDelete = imageWaitDeleteList.filter((i) => {
      return i.hostType === ImageHostType.Cloudinary
    })

    await Promise.all([
      this.removeImageCloudinary(oid, imageCloudinaryWaitDelete),
      this.removeImageGoogleDriver(oid, imageGoogleWaitDelete),
    ])
  }
}

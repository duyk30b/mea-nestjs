import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { User } from '../../../../_libs/database/entities'
import { ImageRepository } from '../../../../_libs/database/repositories'
import { UserRepository } from '../../../../_libs/database/repositories/user.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@Injectable()
export class ApiMeService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository
  ) { }

  async data(params: { oid: number; uid: number; permissionIds: number[] }) {
    const { uid, oid, permissionIds } = params
    const [user, organization, roomIdList, permissionAll, settingMap, settingMapRoot] =
      await Promise.all([
        this.cacheDataService.getUser(oid, uid),
        this.cacheDataService.getOrganization(oid),
        this.cacheDataService.getRoomIdList(oid, uid),
        this.cacheDataService.getPermissionAllList(),
        this.cacheDataService.getSettingMap(oid),
        this.cacheDataService.getSettingMap(1),
      ])

    return {
      user,
      organization,
      roomIdList,
      permissionIds,
      permissionAll,
      settingMap,
      settingMapRoot,
      rootSetting: settingMapRoot.ROOT_SETTING,
    }
  }

  async info(params: { oid: number; uid: number; permissionIds: number[] }) {
    const { uid, oid, permissionIds } = params
    const user = await this.cacheDataService.getUser(oid, uid)

    return { user }
  }

  async changePassword(oid: number, id: number, body: UserChangePasswordBody) {
    const { oldPassword, newPassword } = body
    const user = await this.userRepository.findOneBy({ id, oid })
    if (!user) throw new BusinessException('error.Database.NotFound')

    const checkPassword = await bcrypt.compare(oldPassword, user.hashPassword)
    if (!checkPassword) throw new BusinessException('error.User.WrongPassword')

    const hashPassword = await bcrypt.hash(newPassword, 5)
    const secret = encrypt(newPassword, user.username)

    await this.userRepository.update({ oid, id }, { hashPassword, secret })
    return true
  }

  async updateInfo(options: {
    oid: number
    userId: number
    files: FileUploadDto[]
    body: UserUpdateInfoBody
  }) {
    const { oid, userId, body, files } = options
    const { imagesChange, userInfo } = body

    const userOrigin = await this.userRepository.findOneBy({ oid, id: userId })
    let userModified: User

    let imageIdsStringifyUpdate = userOrigin.imageIds
    if (imagesChange) {
      const imageIdsUpdate = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        ticketId: 0,
        customerId: 0,
        files,
        imageIdsWait: body.imagesChange.imageIdsWait,
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdsOld: JSON.parse(userOrigin.imageIds || '[]'),
      })
      imageIdsStringifyUpdate = JSON.stringify(imageIdsUpdate)
    }

    if (userOrigin.imageIds !== imageIdsStringifyUpdate) {
      userModified = await this.userRepository.updateOneAndReturnEntity(
        { oid, id: userId },
        { ...userInfo, imageIds: imageIdsStringifyUpdate }
      )
    } else {
      userModified = await this.userRepository.updateOneAndReturnEntity(
        { oid, id: userId },
        userInfo
      )
    }

    const imageIdList: number[] = JSON.parse(userModified.imageIds)
    const imageList = await this.imageRepository.findManyByIds(imageIdList)
    const imageMap = ESArray.arrayToKeyValue(imageList, 'id')
    userModified.imageList = imageIdList.map((imageId) => imageMap[imageId]).filter((i) => !!i)

    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { user: userModified }
  }
}

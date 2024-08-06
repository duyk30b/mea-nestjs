import { Injectable } from '@nestjs/common'
import { Organization, Permission, Role, User } from '../../database/entities'
import { SettingKey } from '../../database/entities/setting.entity'
import { OrganizationRepository } from '../../database/repository/organization/organization.repository'
import { PermissionRepository } from '../../database/repository/permission/permission.repository'
import { RoleRepository } from '../../database/repository/role/role.repository'
import { SettingRepository } from '../../database/repository/setting/setting.repository'
import { UserRepository } from '../../database/repository/user/user.repository'
import { arrayToKeyValue } from '../helpers/object.helper'

@Injectable()
export class CacheDataService {
  public organizationMap: Record<string, Organization> = {}
  public userMap: Record<string, User> = {}
  public roleMap: Record<string, Role> = {}
  public permissionMap: Record<string, Permission> = null
  public settingMapMap: Record<string, { -readonly [P in keyof typeof SettingKey]?: any }> = {}

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly settingRepository: SettingRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository
  ) { }

  async getOrganization(oid: number) {
    if (!oid) return null

    if (!this.organizationMap[oid]) {
      this.organizationMap[oid] = await this.organizationRepository.findOneById(oid)
    }
    return this.organizationMap[oid]
  }

  async getSettingMap(oid: number) {
    if (!this.settingMapMap[oid]) {
      const settingList = await this.settingRepository.findManyBy({ oid })
      this.settingMapMap[oid] = {}
      settingList.forEach((i) => {
        const data = i.data ? JSON.parse(i.data) : i.data
        if (i.key === SettingKey.GOOGLE_DRIVER && data?.refreshToken) {
          data.refreshToken = data.refreshToken.slice(0, 20) + '...'
        }
        this.settingMapMap[oid][i.key] = data
      })
    }
    return this.settingMapMap[oid]
  }

  async getEmailGoogleDriver(oid: number) {
    const settingMap = await this.getSettingMap(oid)
    const { email } = settingMap?.[SettingKey.GOOGLE_DRIVER] || { email: '' }
    if (!email) {
      // nếu chưa đăng nhập tài khoản gg driver thì dùng tài khoản của ROOT
      const settingMapROOT = await this.getSettingMap(1)
      const ggROOT = settingMapROOT?.[SettingKey.GOOGLE_DRIVER] || { email: '' }
      return ggROOT.email as string
    }
    return email as string
  }

  async getProductGroupMap(oid: number) {
    const settingMap = await this.getSettingMap(oid)
    const productGroup = settingMap?.[SettingKey.PRODUCT_GROUP] || {
      1: 'Kháng sinh - Kháng Virus',
      2: 'Dị ứng',
      3: 'Thần Kinh',
      4: 'Tiêu Hóa',
      5: 'Cơ Xương Khớp',
      6: 'Giảm Đau - Hạ Sốt',
      8: 'Thực Phẩm Chức Năng',
      9: 'Dinh Dưỡng',
      10: 'Hô hấp',
      11: 'Tim Mạch',
      12: 'Da Liễu',
    }
    return productGroup
  }

  async getSettingAllowNegativeQuantity(oid: number) {
    const settingMap = await this.getSettingMap(oid)
    const { allowNegativeQuantity } = settingMap?.[SettingKey.SYSTEM_SETTING] || {}
    return !!allowNegativeQuantity
  }

  async getUser(id: number) {
    if (!id) return null

    if (!this.userMap[id]) {
      this.userMap[id] = await this.userRepository.findOneById(id)
    }
    return this.userMap[id]
  }

  async getRole(id: number) {
    if (!id) return null

    if (!this.roleMap[id]) {
      this.roleMap[id] = await this.roleRepository.findOneById(id)
    }
    return this.roleMap[id]
  }

  async getPermissionMap() {
    if (!this.permissionMap) {
      const permissionList = await this.permissionRepository.findManyBy({})
      this.permissionMap = arrayToKeyValue(permissionList, 'id')
    }
    return this.permissionMap
  }

  async getPermissionList() {
    const map = await this.getPermissionMap()
    return Object.values(map)
  }

  updateOrganization(organization: Organization) {
    this.organizationMap[organization.id] = organization
  }

  updateUser(user: User) {
    this.userMap[user.id] = user
  }

  updateRole(role: Role) {
    this.roleMap[role.id] = role
  }

  removeOrganization(oid: number) {
    this.organizationMap[oid] = null
  }

  removeSetting(oid: number) {
    this.settingMapMap[oid] = null
  }

  removeUser(id: number) {
    this.userMap[id] = null
  }

  removeRole(id: number) {
    this.roleMap[id] = null
  }

  async reloadPermission() {
    this.permissionMap = null
    await this.getPermissionMap()
  }

  async reloadSettingMap(oid: number) {
    this.settingMapMap[oid] = null
    await this.getSettingMap(oid)
  }
}

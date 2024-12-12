import { Injectable } from '@nestjs/common'
import { Organization, Permission, Role, User } from '../../database/entities'
import { SettingKey } from '../../database/entities/setting.entity'
import UserRole from '../../database/entities/user-role.entity'
import { OrganizationRepository } from '../../database/repositories/organization.repository'
import { PermissionRepository } from '../../database/repositories/permission.repository'
import { RoleRepository } from '../../database/repositories/role.repository'
import { SettingRepository } from '../../database/repositories/setting.repository'
import { UserRoleRepository } from '../../database/repositories/user-role.repository'
import { UserRepository } from '../../database/repositories/user.repository'
import { arrayToKeyValue, uniqueArray } from '../helpers/object.helper'

@Injectable()
export class CacheDataService {
  public orgCache: Record<
    string,
    {
      organization?: Organization
      userMap?: Record<string, User>
      roleMap?: Record<string, Role>
      userRoleList?: UserRole[]
      settingMapMap?: { -readonly [P in keyof typeof SettingKey]?: any }
    }
  > = {}

  public permissionAllMap: Record<string, Permission> = null

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly settingRepository: SettingRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly permissionRepository: PermissionRepository
  ) { }

  async getOrganization(oid: number) {
    if (!oid) return null
    if (!this.orgCache[oid]) this.orgCache[oid] = {}

    if (!this.orgCache[oid].organization) {
      const organization = await this.organizationRepository.findOne({
        relation: { logoImage: true },
        condition: { id: oid },
      })
      try {
        organization.dataVersionParse = JSON.parse(organization.dataVersion)
        organization.dataVersionParse.product ||= 0
        organization.dataVersionParse.batch ||= 0
        organization.dataVersionParse.customer ||= 0
      } catch (error) {
        organization.dataVersionParse = { product: 0, batch: 0, customer: 0 }
      }
      this.orgCache[oid].organization = organization
    }
    return this.orgCache[oid].organization
  }

  async getSettingMap(oid: number) {
    if (!this.orgCache[oid]) this.orgCache[oid] = {}

    if (!this.orgCache[oid].settingMapMap) {
      this.orgCache[oid].settingMapMap = {}
      const settingList = await this.settingRepository.findManyBy({ oid })
      settingList.forEach((i) => {
        const data = i.data ? JSON.parse(i.data) : i.data
        if (i.key === SettingKey.GOOGLE_DRIVER && data?.refreshToken) {
          data.refreshToken = data.refreshToken.slice(0, 20) + '...'
        }
        this.orgCache[oid].settingMapMap[i.key] = data
      })
    }
    return this.orgCache[oid].settingMapMap
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

  async getSettingAllowNegativeQuantity(oid: number) {
    const settingMap = await this.getSettingMap(oid)
    const { allowNegativeQuantity } = settingMap?.[SettingKey.SYSTEM_SETTING] || {}
    return !!allowNegativeQuantity
  }

  async getUser(oid: number, uid: number) {
    if (!oid || !uid) return null
    if (!this.orgCache[oid]) this.orgCache[oid] = {}
    if (!this.orgCache[oid].userMap) this.orgCache[oid].userMap = {}

    if (!this.orgCache[oid].userMap[uid]) {
      this.orgCache[oid].userMap[uid] = await this.userRepository.findOneBy({ oid, id: uid })
    }
    return this.orgCache[oid].userMap[uid]
  }

  async getRole(oid: number, rid: number) {
    if (!oid || !rid) return null
    if (!this.orgCache[oid]) this.orgCache[oid] = {}
    if (!this.orgCache[oid].roleMap) this.orgCache[oid].roleMap = {}

    if (!this.orgCache[oid].roleMap[rid]) {
      this.orgCache[oid].roleMap[rid] = await this.roleRepository.findOneBy({ oid, id: rid })
    }
    return this.orgCache[oid].roleMap[rid]
  }

  async getRoleList(oid: number, uid: number) {
    if (!this.orgCache[oid].userRoleList) {
      this.orgCache[oid].userRoleList = await this.userRoleRepository.findManyBy({ oid })
    }
    const roleIdList = this.orgCache[oid].userRoleList
      .filter((i) => i.userId === uid)
      .map((i) => i.roleId)

    const result: Role[] = []
    for (let i = 0; i < roleIdList.length; i++) {
      const role = await this.getRole(oid, roleIdList[i])
      result.push(role)
    }
    return result
  }

  async getPermissionIdsByUserId(oid: number, uid: number) {
    if (!oid || !uid) return null
    if (!this.orgCache[oid]) this.orgCache[oid] = {}

    const user = await this.getUser(oid, uid)

    const organization = await this.getOrganization(oid)
    const organizationPermissionIds: number[] = JSON.parse(organization.permissionIds)

    let permissionIds = []
    if (user.isAdmin) {
      permissionIds = organizationPermissionIds
    } else {
      const roleList = await this.getRoleList(oid, uid)
      for (let i = 0; i < roleList.length; i++) {
        const currentPermissionIds: number[] = JSON.parse(roleList[i].permissionIds || '[]')
        permissionIds = permissionIds.concat(currentPermissionIds)
      }
      permissionIds = uniqueArray(permissionIds)
    }
    return permissionIds
  }

  async getPermissionAllMap() {
    if (!this.permissionAllMap) {
      const permissionAll = await this.permissionRepository.findManyBy({})
      this.permissionAllMap = arrayToKeyValue(permissionAll, 'id')
    }
    return this.permissionAllMap
  }

  async getPermissionAllList() {
    const map = await this.getPermissionAllMap()
    return Object.values(map)
  }

  updateOrganizationInfo(organization: Organization) {
    const oid = organization.id
    if (!this.orgCache[oid]) this.orgCache[oid] = {}
    try {
      organization.dataVersionParse = JSON.parse(organization.dataVersion)
      organization.dataVersionParse.product ||= 0
      organization.dataVersionParse.batch ||= 0
      organization.dataVersionParse.customer ||= 0
    } catch (error) {
      organization.dataVersionParse = { product: 0, batch: 0, customer: 0 }
    }
    this.orgCache[oid].organization = organization
  }

  clearUserAndRole(oid: number) {
    if (!this.orgCache[oid]) this.orgCache[oid] = {}
    this.orgCache[oid].userMap = {}
    this.orgCache[oid].roleMap = {}
    this.orgCache[oid].userRoleList = null
  }

  clearOrganization(oid: number) {
    if (!this.orgCache[oid]) this.orgCache[oid] = {}
    this.orgCache[oid].organization = null
  }

  clearSettingMap(oid: number) {
    if (!this.orgCache[oid]) this.orgCache[oid] = {}
    this.orgCache[oid].settingMapMap = null
  }

  async reloadPermissionAll() {
    this.permissionAllMap = null
    await this.getPermissionAllMap()
  }

  async reloadSettingMap(oid: number) {
    this.clearSettingMap(oid)
    await this.getSettingMap(oid)
  }
}

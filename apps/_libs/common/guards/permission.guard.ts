import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionId } from '../../database/entities/permission.entity'
import { CacheDataService } from '../../transporter/cache-manager/cache-data.service'
import { BusinessException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

export const HAS_PERMISSION = 'HAS_PERMISSION'
export const HAS_PERMISSION_OR = 'HAS_PERMISSION_OR'
export const HasPermission = (...permissionIds: PermissionId[]) => {
  return SetMetadata(HAS_PERMISSION, permissionIds)
}
export const HasPermissionOr = (...permissionIds: PermissionId[]) => {
  return SetMetadata(HAS_PERMISSION_OR, permissionIds)
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly cacheDataService: CacheDataService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let permissionIdsAnd = this.reflector.getAllAndOverride<PermissionId[]>(HAS_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ])
    let permissionIdsOr = this.reflector.getAllAndOverride<PermissionId[]>(HAS_PERMISSION_OR, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!permissionIdsAnd) permissionIdsAnd = []
    if (!permissionIdsOr) permissionIdsOr = []

    if (!permissionIdsAnd.length && !permissionIdsOr.length) return true

    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    const { external } = requestExternal

    if (external.error) {
      throw new BusinessException(external.error, {}, HttpStatus.UNAUTHORIZED)
    }
    // Nếu user, role, org inactive thì loại từ vòng gửi xe
    if (
      !external.uid
      || !external.oid
      || !external.rid
      || !external.user
      || !external.role
      || !external.organization
      || !!external.user.deletedAt
      || !external.role.isActive
      || !external.organization.isActive
    ) {
      throw new BusinessException('common.AccountInactive', {}, HttpStatus.UNAUTHORIZED)
    }
    // ROOT: oid = 1 được xem mọi API, kể cả API inActive
    if (external.oid === 1) return true

    // Get data để check
    const permissionMap = await this.cacheDataService.getPermissionMap()

    const checkPermissionId = (permissionId: number) => {
      const permission = permissionMap[permissionId]
      const pathIdArr = permission.pathId.split('.').map((i) => Number(i))

      // Kiểm tra API có bị inActive
      for (let i = 0; i < pathIdArr.length; i++) {
        const id = pathIdArr[i]
        const curPermission = permissionMap[id]
        if (!curPermission.isActive) {
          return false // chỉ cần 1 thằng inActive thì là false
        }
      }

      // Check Org ko có quyền thì out
      const organizationPermissionIds: number[] = JSON.parse(
        external.organization.permissionIds || '[]'
      )
      if (!organizationPermissionIds.includes(permission.rootId)) {
        return false
      }

      // Check Role ko có quyền thì out
      if (external.rid === 1) return true // rid === 1 thì có toàn quyền của org (đã check bên trên)
      const rolePermissionIds: number[] = JSON.parse(external.role.permissionIds || '[]')
      if (!pathIdArr.some((pid) => rolePermissionIds.includes(pid))) {
        return false
      }
      return true
    }

    if (permissionIdsAnd.length) {
      // Tất cả PermissionAnd đều phải được OK
      const checkAnd = permissionIdsAnd.every(checkPermissionId)
      if (!checkAnd) {
        const permissionNameArr = permissionIdsAnd.map((i) => permissionMap[i].name).join(', ')
        throw new BusinessException(
          'common.ForbiddenPermission',
          { permission: permissionNameArr },
          HttpStatus.FORBIDDEN
        )
      }
    }

    if (permissionIdsOr.length) {
      // Chỉ cần 1 PermissionOr OK
      const checkOr = permissionIdsOr.some(checkPermissionId)
      if (!checkOr) {
        const permissionNameArr = permissionIdsOr.map((i) => permissionMap[i].name).join(', ')
        throw new BusinessException(
          'common.ForbiddenPermission',
          { permission: permissionNameArr },
          HttpStatus.FORBIDDEN
        )
      }
    }
    return true
  }
}
import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { OrganizationStatus } from '../../database/entities/organization.entity'
import { PermissionId } from '../../permission/permission.enum'
import { CacheDataService } from '../cache-data/cache-data.service'
import { BusinessException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

export const USER_GUARD = 'USER_GUARD'
export const USER_GUARD_OR = 'USER_GUARD_OR'

export const UserPermission = (...permissionIds: PermissionId[]) => {
  return SetMetadata(USER_GUARD, permissionIds)
}
export const UserPermissionOr = (...permissionIds: PermissionId[]) => {
  return SetMetadata(USER_GUARD_OR, permissionIds)
}

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly cacheDataService: CacheDataService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireUserPermission = this.reflector.getAllAndOverride<PermissionId[]>(USER_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    const requireUserPermissionOr = this.reflector.getAllAndOverride<PermissionId[]>(USER_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (requireUserPermission === undefined && requireUserPermission === undefined) {
      return true // nếu không set @UserPermission(..) thì luôn cho qua
    }
    // Yên tâm là nếu chỉ set  @UserPermission() => requireUserPermission = [] (là 1 mảng rỗng)

    // ===== 1. CHECK REQUEST có hợp lệ không =====
    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    const { external } = requestExternal
    if (external.error) {
      throw new BusinessException(external.error, {}, HttpStatus.UNAUTHORIZED)
    }
    if (!external.uid || !external.oid || !external.user || !external.organization) {
      throw new BusinessException('common.AccountRequired', {}, HttpStatus.UNAUTHORIZED)
    }
    // Nếu user, org inactive thì loại từ vòng gửi xe
    if (!!external.user.deletedAt || external.organization.status == OrganizationStatus.Inactive) {
      throw new BusinessException('common.AccountInactive', {}, HttpStatus.UNAUTHORIZED)
    }
    // ROOT: oid = 1 (ROOT) được xem mọi API, kể cả API inActive
    if (external.oid === 1) return true

    // ===== 2. CHECK PERMISSION =====
    // Get data để check
    const permissionMap = await this.cacheDataService.getPermissionAllMap()

    const checkPermissionId = (permissionId: number) => {
      const permission = permissionMap[permissionId]
      const pathIdArr = permission.pathId.split('.').map((i) => Number(i))

      // Kiểm tra Permission đó có bị inActive
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

      // Nếu user là admin thì có toàn quyền
      if (external.user.isAdmin) return true

      // Cuối cùng chỉ cần chứa 1 permissionId trong cây pathIdArr là ok
      const userPermissionIds = pathIdArr.some((pid) => external.permissionIds.includes(pid))
      if (!userPermissionIds) return false

      return true
    }

    if (requireUserPermission.length) {
      // Tất cả PermissionAnd đều phải được OK
      const checkEvery = requireUserPermission.every(checkPermissionId)
      if (!checkEvery) {
        const permissionNameArr = requireUserPermission.map((i) => permissionMap[i].name).join(', ')
        throw new BusinessException(
          'common.ForbiddenUserPermission',
          { permission: permissionNameArr },
          HttpStatus.FORBIDDEN
        )
      }
    }

    if (requireUserPermissionOr.length) {
      // Chỉ cần 1 PermissionOr OK
      const checkOr = requireUserPermissionOr.some(checkPermissionId)
      if (!checkOr) {
        const permissionNameArr = requireUserPermissionOr
          .map((i) => permissionMap[i].name)
          .join(', ')
        throw new BusinessException(
          'common.ForbiddenUserPermission',
          { permission: permissionNameArr },
          HttpStatus.FORBIDDEN
        )
      }
    }

    return true
  }
}

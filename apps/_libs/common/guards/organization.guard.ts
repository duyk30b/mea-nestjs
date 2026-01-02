import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { OrganizationStatus } from '../../database/entities/organization.entity'
import { PermissionId } from '../../permission/permission.enum'
import { CacheDataService } from '../cache-data/cache-data.service'
import { BusinessException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

export const ORGANIZATION_GUARD = 'ORGANIZATION_GUARD'

export const OrganizationPermission = (...permissionIds: PermissionId[]) => {
  return SetMetadata(ORGANIZATION_GUARD, permissionIds)
}

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly cacheDataService: CacheDataService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireOrganizationPermission = this.reflector.getAllAndOverride<PermissionId[]>(
      ORGANIZATION_GUARD,
      [context.getHandler(), context.getClass()]
    )
    if (requireOrganizationPermission === undefined) return true // nếu không set @OrganizationPermission(..) thì luôn cho qua
    // Yên tâm là nếu chỉ set  @OrganizationPermission() => requireOrganizationPermission = [] (là 1 mảng rỗng)

    // ===== 1. CHECK REQUEST có hợp lệ không =====
    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    const { external } = requestExternal
    if (external.error) {
      throw new BusinessException(external.error, {}, HttpStatus.UNAUTHORIZED)
    }
    if (!external.uid || !external.oid || !external.user || !external.organization) {
      throw new BusinessException('common.AccountRequired', {}, HttpStatus.FORBIDDEN)
    }
    // Nếu user, org inactive thì loại từ vòng gửi xe
    if (!!external.user.deletedAt || external.organization.status == OrganizationStatus.Inactive) {
      throw new BusinessException('common.AccountInactive', {}, HttpStatus.FORBIDDEN)
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

      // === Organization thì không check cái này, để UserGuard mới check
      // Cuối cùng chỉ cần chứa 1 permissionId trong cây pathIdArr là ok
      // const userPermissionIds = pathIdArr.some((pid) => external.permissionIds.includes(pid))
      // if (!userPermissionIds) return false

      return true
    }

    if (requireOrganizationPermission.length) {
      // Tất cả PermissionAnd đều phải được OK
      const checkEvery = requireOrganizationPermission.every(checkPermissionId)
      if (!checkEvery) {
        const permissionNameArr = requireOrganizationPermission
          .map((i) => permissionMap[i].name)
          .join(', ')
        throw new BusinessException(
          'common.ForbiddenOrganizationPermission',
          { permission: permissionNameArr },
          HttpStatus.FORBIDDEN
        )
      }
    }

    return true
  }
}

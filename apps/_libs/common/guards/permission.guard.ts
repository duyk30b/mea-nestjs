import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionId } from '../../database/entities/permission.entity'
import { CacheDataService } from '../../transporter/cache-manager/cache-data.service'
import { BusinessException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

export const PERMISSION_GUARD = 'PERMISSION_GUARD'
export const HasPermission = (permissionId: PermissionId) =>
  SetMetadata(PERMISSION_GUARD, permissionId)

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly cacheDataService: CacheDataService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionId = this.reflector.getAllAndOverride<PermissionId>(PERMISSION_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!permissionId) return true

    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    const { external } = requestExternal

    if (requestExternal.external.error) {
      throw new BusinessException(requestExternal.external.error, {}, HttpStatus.UNAUTHORIZED)
    }

    // Get data để check
    const permissionMap = await this.cacheDataService.getPermissionMap()
    const permission = permissionMap[permissionId]
    const pathIdArr = permission.pathId.split('.').map((i) => Number(i))

    // Nếu user, role, org inactive thì false
    if (
      !external.uid ||
      !external.oid ||
      !external.rid ||
      !external.user ||
      !external.role ||
      !external.organization ||
      !!external.user.deletedAt ||
      !external.role.isActive ||
      !external.organization.isActive
    ) {
      throw new BusinessException('common.AccountInactive', {}, HttpStatus.FORBIDDEN)
    }

    // ROOT: oid = 1 được xem mọi API, kể cả API inActive
    if (external.oid === 1) return true

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
      throw new BusinessException(
        'common.ForbiddenPermission',
        { permission: permission.name },
        HttpStatus.FORBIDDEN
      )
    }

    // Check Role ko có quyền thì out
    if (external.rid === 1) return true // rid === 1 thì có toàn quyền của org (đã check bên trên)
    const rolePermissionIds: number[] = JSON.parse(external.role.permissionIds || '[]')
    if (!pathIdArr.some((pid) => rolePermissionIds.includes(pid))) {
      throw new BusinessException(
        'common.ForbiddenPermission',
        { permission: permission.name },
        HttpStatus.FORBIDDEN
      )
    }
    return true
  }
}

import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BusinessException } from '../../../_libs/common/exception-filter/exception-filter'
import { RequestExternal } from '../../../_libs/common/request/external.request'
import { PermissionId } from '../../../_libs/database/entities/permission.entity'
import { OrganizationRepository } from '../../../_libs/database/repository/organization/organization.repository'
import { PermissionRepository } from '../../../_libs/database/repository/permission/permission.repository'
import { RoleRepository } from '../../../_libs/database/repository/role/role.repository'
import { UserRepository } from '../../../_libs/database/repository/user/user.repository'

export const PERMISSION_GUARD = 'PERMISSION_GUARD'
export const HasPermission = (permissionId: PermissionId) =>
  SetMetadata(PERMISSION_GUARD, permissionId)

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly userRepository: UserRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionId = this.reflector.getAllAndOverride<PermissionId>(PERMISSION_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!permissionId) return true

    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    const { uid, oid } = requestExternal.external

    if (requestExternal.external.error) {
      throw new BusinessException(requestExternal.external.error, {}, HttpStatus.UNAUTHORIZED)
    }

    // Get data để check
    const [users, permissionMap] = await Promise.all([
      this.userRepository.findMany({
        relationLoadStrategy: 'join',
        relation: { organization: true, role: true },
        condition: { oid, id: uid },
      }),
      this.permissionRepository.getMapFromCache(),
    ])
    const user = users[0]

    const permission = permissionMap[permissionId]
    const pathIdArr = permission.pathId.split('.').map((i) => Number(i))

    // Nếu user, role, org inactive thì false
    if (
      !user ||
      !user.isActive ||
      !user.organization ||
      !user.organization.isActive ||
      user.role?.isActive === 0 // với roleId = 0 | 1  thì không có role
    ) {
      throw new BusinessException('common.AccountInactive', {}, HttpStatus.FORBIDDEN)
    }

    // ROOT: oid = 0 được xem mọi API, kể cả API inActive
    if (user.oid === 0) return true

    // Kiểm tra API có bị inActive
    for (let i = 0; i < pathIdArr.length; i++) {
      const id = pathIdArr[i]
      const curPermission = permissionMap[id]
      if (!curPermission.isActive) {
        return false // chỉ cần 1 thằng inActive thì là false
      }
    }

    // Check Org ko có quyền thì out
    const organizationPermissionIds: number[] = JSON.parse(user.organization.permissionIds || '[]')
    if (!organizationPermissionIds.includes(permission.rootId)) {
      throw new BusinessException(
        'common.ForbiddenPermission',
        { permission: permission.name },
        HttpStatus.FORBIDDEN
      )
    }

    // Check Role ko có quyền thì out
    if (user.roleId === 1) return true
    const rolePermissionIds: number[] = JSON.parse(user.role.permissionIds || '[]')
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

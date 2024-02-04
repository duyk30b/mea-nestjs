import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RequestExternal } from '../../../_libs/common/request/external.request'
import { Role } from '../../../_libs/database/entities'
import Permission, {
  PermissionId,
  PermissionStatus,
} from '../../../_libs/database/entities/permission.entity'
import { PermissionRepository } from '../../../_libs/database/repository/permission/permission.repository'
import { RoleRepository } from '../../../_libs/database/repository/role/role.repository'

export const PERMISSION_GUARD = 'PERMISSION_GUARD'
export const IsPermission = (permissionId: PermissionId) =>
  SetMetadata(PERMISSION_GUARD, permissionId)

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionId = this.reflector.getAllAndOverride<PermissionId>(PERMISSION_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!permissionId) return true

    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    const { roleId } = requestExternal.external

    if (roleId === 0) return true // RoleID = 0 là ROOT được xem mọi API

    const permissionAll = await this.permissionRepository.findManyBy({})
    const PermissionDataMap: Record<string, Permission> = {}
    permissionAll.forEach((i) => (PermissionDataMap[i.id] = i))

    const permission = PermissionDataMap[permissionId]
    const pathIdArr = permission.pathId.split('.').map((i) => Number(i))

    let publicCheck = false
    for (let i = 0; i < pathIdArr.length; i++) {
      const id = pathIdArr[i]
      const curPermission = PermissionDataMap[id]
      if (curPermission.status === PermissionStatus.PUBLIC) {
        publicCheck = true
      } else if (curPermission.status === PermissionStatus.BLOCK) {
        return false // chỉ cần 1 thằng block thì là false
      }
    }
    if (publicCheck) return true // nếu có public thì pass

    const role: Role = await this.roleRepository.findOneById(roleId)
    if (!role) {
      return false
    }
    const rolePermissionIds: number[] = JSON.parse(role.permissionIds)
    return pathIdArr.some((pid) => rolePermissionIds.includes(pid)) // role chỉ cần chứa 1 permissionId là pass
  }
}

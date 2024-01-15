import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RequestExternal } from '../../../_libs/common/request/external.request'
import { ERole } from '../../../_libs/database/common/variable'

export const Roles = (...roles: ERole[]) => SetMetadata('roles_guard', roles)

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<ERole[]>('roles_guard', [
            context.getHandler(),
            context.getClass(),
        ])
        if (!requiredRoles) return true

        const request: RequestExternal = context.switchToHttp().getRequest()
        const { role } = request.external

        return requiredRoles.includes(role)
    }
}

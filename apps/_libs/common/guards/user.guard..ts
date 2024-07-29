import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BusinessException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

export const USER_GUARD = 'USER_GUARD'
export const IsUser = () => SetMetadata(USER_GUARD, true)

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireUser = this.reflector.getAllAndOverride<boolean>(USER_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requireUser) return true

    const request = context.switchToHttp().getRequest()
    const { external }: RequestExternal = request.raw // Fastify phải đọc trong Raw
    if (external.error) {
      throw new BusinessException(external.error, {}, HttpStatus.UNAUTHORIZED)
    }

    if (
      !external.uid
      || !external.oid
      || !external.user
      || !external.organization
      || !!external.user.deletedAt
      || !external.organization.isActive
    ) {
      throw new BusinessException('error.Token.AccessTokenExpired', {}, HttpStatus.UNAUTHORIZED)
    }

    return true
  }
}

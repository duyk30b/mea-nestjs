import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BusinessException } from '../../../_libs/common/exception-filter/exception-filter'
import { RequestExternal } from '../../../_libs/common/request/external.request'

export const USER_GUARD = 'USER_GUARD'
export const IsUser = () => SetMetadata(USER_GUARD, true)

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireUser = this.reflector.getAllAndOverride<boolean>(USER_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requireUser) return true

    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    const { uid, oid } = requestExternal.external
    if (uid == null || oid == null) {
      throw new BusinessException('error.Token.Invalid', {}, HttpStatus.UNAUTHORIZED)
    }

    return true
  }
}

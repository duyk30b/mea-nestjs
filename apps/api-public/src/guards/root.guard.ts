import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BusinessException } from '../../../_libs/common/exception-filter/exception-filter'
import { RequestExternal } from '../../../_libs/common/request/external.request'

export const ROOT_GUARD = 'ROOT_GUARD'
export const IsRoot = () => SetMetadata(ROOT_GUARD, true)

@Injectable()
export class RootGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoot = this.reflector.getAllAndOverride<boolean>(ROOT_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requireRoot) return true

    const request = context.switchToHttp().getRequest()
    const requestExternal: RequestExternal = request.raw // Fastify phải đọc trong Raw
    if (requestExternal.external.error) {
      throw new BusinessException(requestExternal.external.error, {}, HttpStatus.UNAUTHORIZED)
    }
    return requestExternal.external.oid === 0 // ROOT có oid = 0
  }
}

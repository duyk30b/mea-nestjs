import { CanActivate, ExecutionContext, HttpStatus, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BusinessException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

export const ROOT_GUARD = 'ROOT_GUARD'
export const IsRoot = () => SetMetadata(ROOT_GUARD, true)

@Injectable()
export class RootGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoot = this.reflector.getAllAndOverride<boolean>(ROOT_GUARD, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requireRoot) return true

    const request = context.switchToHttp().getRequest()
    const { external }: RequestExternal = request.raw // Fastify phải đọc trong Raw
    if (
      !external.uid
      || !external.oid
      || !external.user
      || !external.organization
      || !!external.user.deletedAt
      || !external.organization.isActive
    ) {
      throw new BusinessException(external.error, {}, HttpStatus.UNAUTHORIZED)
    }

    return external.oid === 1 // ROOT có oid = 1
  }
}

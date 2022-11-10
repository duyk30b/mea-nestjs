import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ERole } from '_libs/database/common/variable'
import { RequestToken } from '../common/constants'

export const Roles = (...roles: ERole[]) => SetMetadata('roles_guard', roles)

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) { }

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<ERole[]>('roles_guard', [
			context.getHandler(),
			context.getClass(),
		])
		if (!requiredRoles) return true

		const request: RequestToken = context.switchToHttp().getRequest()
		const { role } = request.tokenPayload

		return requiredRoles.includes(role)
	}
}

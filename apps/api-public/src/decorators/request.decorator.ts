import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { getClientIp } from 'request-ip'
import { RequestToken } from '../common/constants'

export const IpRequest = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest()
	return getClientIp(request)
})

export const OrganizationId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request: RequestToken = ctx.switchToHttp().getRequest()
	return request.tokenPayload.oid
})

export type TUserReq = {
	oid: number,
	id: number,
	ip: string
}

export const UserReq = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request: RequestToken = ctx.switchToHttp().getRequest()
	return {
		oid: request.tokenPayload.oid,
		uid: request.tokenPayload.uid,
		ip: getClientIp(request),
	}
})

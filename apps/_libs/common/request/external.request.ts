import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { I18nPath } from '../../../../assets/generated/i18n.generated'
import { Organization, Role, User } from '../../database/entities'

export type TExternal = {
  ip: string
  os: string
  browser: string
  mobile: 1 | 0
  uid?: number
  oid?: number
  rid?: number
  error?: I18nPath
  user: User
  organization: Organization
  role: Role
}

export interface RequestExternal extends FastifyRequest {
  external: TExternal
}

export const External = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const requestExternal: RequestExternal = request.raw // fastify phải vào raw mới lấy đc request
  return requestExternal.external
})

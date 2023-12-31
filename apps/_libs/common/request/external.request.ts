import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { ERole } from '../../database/common/variable'

export type TExternal = {
    ip: string
    oid?: number
    uid?: number
    username?: string
    role?: ERole
    orgPhone?: string
}

export interface RequestExternal extends Request {
    external: TExternal
}

export const External = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request: RequestExternal = ctx.switchToHttp().getRequest()
    return request.external
})

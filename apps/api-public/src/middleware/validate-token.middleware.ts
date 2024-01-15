import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { RequestExternal, TExternal } from '../../../_libs/common/request/external.request'
import { JwtExtendService } from '../components/jwt-extend/jwt-extend.service'

@Injectable()
export class ValidateTokenMiddleware implements NestMiddleware {
    constructor(private readonly jwtExtendService: JwtExtendService) {}

    async use(req: RequestExternal, res: Response, next: NextFunction) {
        const authorization = req.header('Authorization') || ''
        const [, accessToken] = authorization.split(' ')

        const decode: TExternal = this.jwtExtendService.verifyAccessToken(accessToken, req.external.ip)
        req.external = {
            ...req.external,
            ...decode,
        }
        next()
    }
}

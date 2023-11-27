import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { getClientIp } from 'request-ip'
import { RequestExternal } from '../common/request-external'

@Injectable()
export class DetectClientMiddleware implements NestMiddleware {
    async use(req: RequestExternal, res: Response, next: NextFunction) {
        const ip = getClientIp(req)
        if (req.external) {
            throw new Error('Cannot replace property "external"')
        }
        req.external = { ip }
        next()
    }
}

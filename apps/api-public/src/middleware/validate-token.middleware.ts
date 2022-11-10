import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { getClientIp } from 'request-ip'
import { IAccessTokenPayload, RequestToken } from '../common/constants'
import { JwtExtendService } from '../components/jwt-extend/jwt-extend.service'

@Injectable()
export class ValidateTokenMiddleware implements NestMiddleware {
	constructor(private readonly jwtExtendService: JwtExtendService) { }

	async use(req: RequestToken, res: Response, next: NextFunction) {
		const authorization = req.header('Authorization') || ''
		const [, accessToken] = authorization.split(' ')

		const ip = getClientIp(req)
		const decode: IAccessTokenPayload = this.jwtExtendService.verifyAccessToken(accessToken, ip)
		req.tokenPayload = decode
		next()
	}
}

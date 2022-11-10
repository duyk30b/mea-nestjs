import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const { url, method } = req

		const msg = `[${new Date().toISOString()}] Request: ${method} ${url} `
		console.log(msg)
		next()
	}
}

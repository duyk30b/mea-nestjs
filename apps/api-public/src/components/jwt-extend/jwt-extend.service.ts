import { HttpException, HttpStatus, Inject } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import Employee from '_libs/database/entities/employee.entity'
import { IAccessTokenPayload, IRefreshTokenPayload } from '../../common/constants'
import { JwtConfig } from '../../environments'
import { ErrorMessage } from '../../exception-filters/exception.const'

export class JwtExtendService {
	constructor(
		@Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
		private readonly jwtService: JwtService
	) { }

	createAccessToken(user: Employee, ip: string): { token: string, exp: number } {
		const userPayload: IAccessTokenPayload = {
			ip,
			orgPhone: user.organization.phone,
			oid: user.organization.id,
			uid: user.id,
			username: user.username,
			role: user.role,
		}
		const exp = Date.now() + this.jwtConfig.accessTime

		const token = this.jwtService.sign({
			exp: Math.floor(exp / 1000),
			data: userPayload,
		}, { secret: this.jwtConfig.accessKey })
		return { token, exp }
	}

	createRefreshToken(user: Employee, ip: string): { token: string, exp: number } {
		const userPayload: IRefreshTokenPayload = {
			ip,
			oid: user.organization.id,
			uid: user.id,
		}
		const exp = Date.now() + this.jwtConfig.refreshTime

		const token = this.jwtService.sign({
			exp: Math.floor(exp / 1000),
			data: userPayload,
		}, { secret: this.jwtConfig.refreshKey })
		return { token, exp }
	}

	createTokenFromUser(user: Employee, ip: string) {
		const accessToken = this.createAccessToken(user, ip)
		const refreshToken = this.createRefreshToken(user, ip)
		return { accessToken, refreshToken }
	}

	verifyAccessToken(accessToken: string, ip: string): IAccessTokenPayload {
		try {
			const jwtPayload = this.jwtService.verify(accessToken, { secret: this.jwtConfig.accessKey })

			const data = jwtPayload.data as IAccessTokenPayload
			// if (data.ip !== ip) throw new Error(ErrorMessage.Token.WrongIp) // accessToken allow change ip

			return data
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw new HttpException(ErrorMessage.Token.Expired, HttpStatus.UNAUTHORIZED)
			} else if (error.name === 'JsonWebTokenError') {
				throw new HttpException(ErrorMessage.Token.Invalid, HttpStatus.UNAUTHORIZED)
			} else if (error.message === ErrorMessage.Token.Invalid) {
				throw new HttpException(ErrorMessage.Token.Invalid, HttpStatus.UNAUTHORIZED)
			}
			throw new HttpException(ErrorMessage.Unknown, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	verifyRefreshToken(refreshToken: string, ip: string): { oid: number, uid: number } {
		try {
			const jwtPayload = this.jwtService.verify(refreshToken, { secret: this.jwtConfig.refreshKey })

			const data = jwtPayload.data as IRefreshTokenPayload
			if (data.ip !== ip) throw new Error(ErrorMessage.Token.WrongIp)

			return data
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw new HttpException(ErrorMessage.Token.Expired, HttpStatus.FORBIDDEN)
			} else if (error.name === 'JsonWebTokenError') {
				throw new HttpException(ErrorMessage.Token.Invalid, HttpStatus.FORBIDDEN)
			} else if (error.message === ErrorMessage.Token.WrongIp) {
				throw new HttpException(ErrorMessage.Token.WrongIp, HttpStatus.FORBIDDEN)
			}
			throw new HttpException(ErrorMessage.Unknown, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
}

import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { TExternal } from '../../../../_libs/common/request/external.request'
import { IRefreshTokenPayload } from '../../../../_libs/common/request/payload'
import User from '../../../../_libs/database/entities/user.entity'
import { JwtConfig } from '../../environments'

@Injectable()
export class JwtExtendService {
    constructor(
        @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
        private readonly jwtService: JwtService
    ) {}

    createAccessToken(user: User, ip: string): { token: string; exp: number } {
        const userPayload: TExternal = {
            ip,
            orgPhone: user.organization.phone,
            oid: user.organization.id,
            uid: user.id,
            username: user.username,
            role: user.role,
        }
        const exp = Date.now() + this.jwtConfig.accessTime

        const token = this.jwtService.sign(
            {
                exp: Math.floor(exp / 1000),
                data: userPayload,
            },
            { secret: this.jwtConfig.accessKey }
        )
        return { token, exp }
    }

    createRefreshToken(user: User, ip: string): { token: string; exp: number } {
        const userPayload: IRefreshTokenPayload = {
            ip,
            oid: user.organization.id,
            uid: user.id,
        }
        const exp = Date.now() + this.jwtConfig.refreshTime

        const token = this.jwtService.sign(
            {
                exp: Math.floor(exp / 1000),
                data: userPayload,
            },
            { secret: this.jwtConfig.refreshKey }
        )
        return { token, exp }
    }

    createTokenFromUser(user: User, ip: string) {
        const accessToken = this.createAccessToken(user, ip)
        const refreshToken = this.createRefreshToken(user, ip)
        return { accessToken, refreshToken }
    }

    verifyAccessToken(accessToken: string, ip: string): TExternal {
        try {
            const jwtPayload = this.jwtService.verify(accessToken, {
                secret: this.jwtConfig.accessKey,
            })

            const data = jwtPayload.data as TExternal
            // if (data.ip !== ip) throw new Error(ErrorMessage.Token.WrongIp) // accessToken allow change ip

            return data
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new BusinessException('common.Token.Expired', HttpStatus.UNAUTHORIZED)
            } else if (error.name === 'JsonWebTokenError') {
                throw new BusinessException('common.Token.Invalid', HttpStatus.UNAUTHORIZED)
            }
            throw error
        }
    }

    verifyRefreshToken(refreshToken: string, ip: string): { oid: number; uid: number } {
        try {
            const jwtPayload = this.jwtService.verify(refreshToken, {
                secret: this.jwtConfig.refreshKey,
            })

            const data = jwtPayload.data as IRefreshTokenPayload
            // if (data.ip !== ip) throw new Error(ErrorMessage.Token.WrongIp)

            return data
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new BusinessException('common.Token.Expired', HttpStatus.UNAUTHORIZED)
            } else if (error.name === 'JsonWebTokenError') {
                throw new BusinessException('common.Token.Invalid', HttpStatus.UNAUTHORIZED)
            }
            throw error
        }
    }
}

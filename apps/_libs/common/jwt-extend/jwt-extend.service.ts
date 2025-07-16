import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import User from '../../database/entities/user.entity'
import { BusinessException } from '../exception-filter/exception-filter'
import { IAccessTokenPayload, IRefreshTokenPayload } from '../request/payload'
import { JwtConfig } from './jwt.config'

@Injectable()
export class JwtExtendService {
  constructor(
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
    private readonly jwtService: JwtService
  ) { }

  createAccessToken(user: User, ip: string) {
    const userPayload: IAccessTokenPayload = {
      oid: user.organization.id,
      uid: user.id,
    }
    const exp = Math.floor((Date.now() + this.jwtConfig.accessTime) / 1000)

    const accessToken = this.jwtService.sign(
      { exp, data: userPayload },
      { secret: this.jwtConfig.accessKey }
    )
    return { accessToken, accessExp: exp * 1000 }
  }

  createRefreshToken(user: User, ip: string) {
    const userPayload: IRefreshTokenPayload = {
      oid: user.organization.id,
      uid: user.id,
    }
    const exp = Math.floor((Date.now() + this.jwtConfig.refreshTime) / 1000)

    const refreshToken = this.jwtService.sign(
      { exp, data: userPayload },
      { secret: this.jwtConfig.refreshKey }
    )
    return { refreshToken, refreshExp: exp * 1000 }
  }

  createTokenFromUser(user: User, ip: string) {
    const { accessToken, accessExp } = this.createAccessToken(user, ip)
    const { refreshToken, refreshExp } = this.createRefreshToken(user, ip)
    return { accessToken, refreshToken, accessExp, refreshExp }
  }

  verifyAccessToken(
    accessToken: string,
    ip: string
  ): { exp: number; data: IAccessTokenPayload; iat: number } {
    try {
      const jwtPayload = this.jwtService.verify(accessToken, {
        secret: this.jwtConfig.accessKey,
      })
      const data: IAccessTokenPayload = jwtPayload.data
      // if (data.ip !== ip) throw new Error(ErrorMessage.Token.WrongIp) // accessToken allow change ip
      return {
        data: jwtPayload.data,
        exp: jwtPayload.exp * 1000,
        iat: jwtPayload.iat * 1000,
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BusinessException('error.Token.AccessTokenExpired', {}, HttpStatus.UNAUTHORIZED)
      } else if (error.name === 'JsonWebTokenError') {
        throw new BusinessException('error.Token.Invalid', {}, HttpStatus.UNAUTHORIZED)
      }
      throw error
    }
  }

  verifyRefreshToken(
    refreshToken: string,
    ip: string
  ): { exp: number; data: IRefreshTokenPayload; iat: number } {
    try {
      const jwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.refreshKey,
      })

      const data: IRefreshTokenPayload = jwtPayload.data
      // if (data.ip !== ip) throw new Error(ErrorMessage.Token.WrongIp)

      return {
        data: jwtPayload.data,
        exp: jwtPayload.exp * 1000,
        iat: jwtPayload.iat * 1000,
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BusinessException('error.Token.RefreshTokenExpired', {}, HttpStatus.UNAUTHORIZED)
      } else if (error.name === 'JsonWebTokenError') {
        throw new BusinessException('error.Token.Invalid', {}, HttpStatus.UNAUTHORIZED)
      }
      throw error
    }
  }

  decodeRefreshToken(refreshToken: string) {
    const jwtPayload = this.jwtService.decode(refreshToken)
    return {
      data: jwtPayload.data,
      exp: jwtPayload.exp * 1000,
      iat: jwtPayload.iat * 1000,
    }
  }
}

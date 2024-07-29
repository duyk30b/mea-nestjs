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
  ) {}

  createAccessToken(user: User, ip: string) {
    const userPayload: IAccessTokenPayload = {
      oid: user.organization.id,
      uid: user.id,
    }
    const exp = Date.now() + this.jwtConfig.accessTime

    const accessToken = this.jwtService.sign(
      {
        exp: Math.floor(exp / 1000),
        data: userPayload,
      },
      { secret: this.jwtConfig.accessKey }
    )
    return { accessToken, accessExp: exp }
  }

  createRefreshToken(user: User, ip: string) {
    const userPayload: IRefreshTokenPayload = {
      oid: user.organization.id,
      uid: user.id,
    }
    const exp = Date.now() + this.jwtConfig.refreshTime

    const refreshToken = this.jwtService.sign(
      {
        exp: Math.floor(exp / 1000),
        data: userPayload,
      },
      { secret: this.jwtConfig.refreshKey }
    )
    return { refreshToken, refreshExp: exp }
  }

  createTokenFromUser(user: User, ip: string) {
    const { accessToken, accessExp } = this.createAccessToken(user, ip)
    const { refreshToken, refreshExp } = this.createRefreshToken(user, ip)
    return { accessToken, refreshToken, accessExp, refreshExp }
  }

  verifyAccessToken(accessToken: string, ip: string): IAccessTokenPayload {
    try {
      const jwtPayload = this.jwtService.verify(accessToken, {
        secret: this.jwtConfig.accessKey,
      })

      const data = jwtPayload.data as IAccessTokenPayload
      // if (data.ip !== ip) throw new Error(ErrorMessage.Token.WrongIp) // accessToken allow change ip

      return data
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BusinessException('error.Token.Expired', {}, HttpStatus.UNAUTHORIZED)
      } else if (error.name === 'JsonWebTokenError') {
        throw new BusinessException('error.Token.Invalid', {}, HttpStatus.UNAUTHORIZED)
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
        throw new BusinessException('error.Token.Expired', {}, HttpStatus.UNAUTHORIZED)
      } else if (error.name === 'JsonWebTokenError') {
        throw new BusinessException('error.Token.Invalid', {}, HttpStatus.UNAUTHORIZED)
      }
      throw error
    }
  }
}

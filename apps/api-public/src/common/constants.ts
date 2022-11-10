import { Request } from 'express'
import { ERole } from '_libs/database/common/variable'

export interface IAccessTokenPayload {
	ip: string
	username: string,
	role: ERole,
	oid: number,
	uid: number,
	orgPhone: string
}

export interface IRefreshTokenPayload {
	ip: string,
	uid: number,
	oid: number
}

export interface RequestToken extends Request {
	tokenPayload: IAccessTokenPayload
}

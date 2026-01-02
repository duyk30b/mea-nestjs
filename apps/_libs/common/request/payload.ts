export interface IAccessTokenPayload {
  uid: number
  oid: number
  clientId: string
}

export interface IRefreshTokenPayload {
  uid: number
  oid: number
  clientId: string
}

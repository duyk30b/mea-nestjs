import { Expose } from 'class-transformer'

export default class Device {
  @Expose()
  oid: number

  @Expose()
  id: number

  @Expose()
  refreshExp: number

  @Expose()
  ip: string

  @Expose()
  os: string

  @Expose()
  browser: string

  @Expose()
  mobile: 0 | 1

  @Expose()
  online: boolean | number
}

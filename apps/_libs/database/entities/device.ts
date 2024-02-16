import { Expose } from 'class-transformer'

export default class Device {
  @Expose()
  oid: number

  @Expose()
  id: number

  @Expose()
  code: string

  @Expose()
  ip: string

  @Expose()
  os: string

  @Expose()
  browser: string

  @Expose()
  mobile: 1 | 0
}

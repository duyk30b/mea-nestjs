import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export enum ImageHostType {
  GoogleDriver = 'GoogleDriver',
  Cloudinary = 'Cloudinary',
}

export enum ImageInteractType {
  Organization = 1,
  User = 2,
  Customer = 3,
}

@Entity('Image')
@Index('IDX_Image__oid_imageInteractType_imageInteractId_ticketId', [
  'oid',
  'imageInteractType',
  'imageInteractId',
  'ticketId',
])
export default class Image {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 25, default: ImageInteractType.Customer })
  @Expose()
  imageInteractType: ImageInteractType // Loại hình ảnh

  @Column({ default: 0 })
  @Expose()
  imageInteractId: number // customerId, UserId, OrganizationId

  @Column({ type: 'bigint' })
  @Expose()
  ticketId: string

  @Column({ type: 'bigint', default: 0 })
  @Expose()
  ticketItemId: string

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  name: string

  @Column({ type: 'varchar', length: 100 })
  @Expose()
  mimeType: string

  @Column({})
  @Expose()
  size: number // tính theo bytes nhé

  @Column({ type: 'varchar', length: 50, default: ImageHostType.GoogleDriver })
  @Expose()
  hostType: ImageHostType

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  hostAccount: string

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  externalId: string

  @Column({ type: 'varchar', length: 255, default: '' })
  @Expose()
  externalUrl: string

  @Column({ type: 'smallint', default: 0 })
  @Expose()
  waitDelete: 0 | 1

  static fromRaw(raw: { [P in keyof Image]: any }) {
    if (!raw) return null
    const entity = new Image()
    Object.assign(entity, raw)

    return entity
  }

  static fromRaws(raws: { [P in keyof Image]: any }[]) {
    return raws.map((i) => Image.fromRaw(i))
  }
}

export type ImageRelationType = {
  [P in keyof Pick<Image, never>]?: boolean
}

export type ImageInsertType = Omit<
  Image,
  keyof ImageRelationType | keyof Pick<Image, 'id' | 'waitDelete'>
>

export type ImageUpdateType = {
  [K in Exclude<keyof Image, keyof ImageRelationType | keyof Pick<Image, 'oid' | 'id'>>]:
  | Image[K]
  | (() => string)
}

export type ImageSortType = {
  [P in keyof Pick<Image, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}

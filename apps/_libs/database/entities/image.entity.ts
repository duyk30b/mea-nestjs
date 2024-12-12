import { Exclude, Expose } from 'class-transformer'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum ImageHost {
  GoogleDriver = 'GoogleDriver',
}

@Entity('Image')
export default class Image {
  @Exclude()
  @Column()
  oid: number

  @Expose()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: 0 })
  @Expose()
  customerId: number

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  name: string

  @Column({ type: 'varchar', length: 100 })
  @Expose()
  mimeType: string

  @Column({})
  @Expose()
  size: number // tính theo bytes nhé

  @Column({ type: 'varchar', length: 50, default: ImageHost.GoogleDriver })
  @Expose()
  hostType: ImageHost

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  hostAccount: string

  @Column({ type: 'varchar', length: 50 })
  @Expose()
  hostId: string

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
  [K in Exclude<
    keyof Image,
    keyof ImageRelationType | keyof Pick<Image, 'oid' | 'id'>
  >]: Image[K] | (() => string)
}

export type ImageSortType = {
  [P in keyof Pick<Image, 'oid' | 'id'>]?: 'ASC' | 'DESC'
}
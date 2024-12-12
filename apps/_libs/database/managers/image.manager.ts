import { Injectable } from '@nestjs/common'
import { Image } from '../entities'
import {
  ImageInsertType,
  ImageRelationType,
  ImageSortType,
  ImageUpdateType,
} from '../entities/image.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class ImageManager extends _PostgreSqlManager<
  Image,
  ImageRelationType,
  ImageInsertType,
  ImageUpdateType,
  ImageSortType
> {
  constructor() {
    super(Image)
  }
}

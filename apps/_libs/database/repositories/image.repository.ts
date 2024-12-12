import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Image } from '../entities'
import {
  ImageInsertType,
  ImageRelationType,
  ImageSortType,
  ImageUpdateType,
} from '../entities/image.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ImageRepository extends _PostgreSqlRepository<
  Image,
  ImageRelationType,
  ImageInsertType,
  ImageUpdateType,
  ImageSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Image) private imageRepository: Repository<Image>
  ) {
    super(Image, imageRepository)
  }
}

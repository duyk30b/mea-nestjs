import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Image } from '../../entities'
import {
  ImageInsertType,
  ImageRelationType,
  ImageSortType,
  ImageUpdateType,
} from '../../entities/image.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ImageRepository extends PostgreSqlRepository<
  Image,
  { [P in keyof ImageSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ImageRelationType]?: never },
  ImageInsertType,
  ImageUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Image) private imageRepository: Repository<Image>
  ) {
    super(imageRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<ImageInsertType>>(
    data: NoExtra<Partial<ImageInsertType>, X>
  ): Promise<Image> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Image.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ImageUpdateType>>(
    condition: BaseCondition<Image>,
    data: NoExtra<Partial<ImageUpdateType>, X>
  ): Promise<Image[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Image.fromRaws(raws)
  }
}

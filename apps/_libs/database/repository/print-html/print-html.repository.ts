import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { PrintHtml } from '../../entities'
import { PrintHtmlInsertType, PrintHtmlRelationType, PrintHtmlSortType, PrintHtmlUpdateType } from '../../entities/print-html.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class PrintHtmlRepository extends PostgreSqlRepository<
  PrintHtml,
  { [P in keyof PrintHtmlSortType]?: 'ASC' | 'DESC' },
  { [P in keyof PrintHtmlRelationType]?: boolean },
  PrintHtmlInsertType,
  PrintHtmlUpdateType
> {
  constructor(
    @InjectRepository(PrintHtml)
    private printHtmlRepository: Repository<PrintHtml>
  ) {
    super(printHtmlRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<PrintHtmlInsertType>>(
    data: NoExtra<Partial<PrintHtmlInsertType>, X>
  ): Promise<PrintHtml> {
    const raw = await this.insertOneAndReturnRaw(data)
    return PrintHtml.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends PrintHtmlInsertType>(
    data: NoExtra<PrintHtmlInsertType, X>
  ): Promise<PrintHtml> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return PrintHtml.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<PrintHtmlUpdateType>>(
    condition: BaseCondition<PrintHtml>,
    data: NoExtra<Partial<PrintHtmlUpdateType>, X>
  ): Promise<PrintHtml[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return PrintHtml.fromRaws(raws)
  }
}

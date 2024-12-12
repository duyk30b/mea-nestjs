import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PrintHtml } from '../entities'
import { PrintHtmlInsertType, PrintHtmlRelationType, PrintHtmlSortType, PrintHtmlUpdateType } from '../entities/print-html.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PrintHtmlRepository extends _PostgreSqlRepository<
  PrintHtml,
  PrintHtmlRelationType,
  PrintHtmlInsertType,
  PrintHtmlUpdateType,
  PrintHtmlSortType
> {
  constructor(
    @InjectRepository(PrintHtml)
    private printHtmlRepository: Repository<PrintHtml>
  ) {
    super(PrintHtml, printHtmlRepository)
  }
}

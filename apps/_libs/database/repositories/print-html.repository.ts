import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PrintHtml } from '../entities'
import { PrintHtmlInsertType, PrintHtmlRelationType, PrintHtmlSortType, PrintHtmlUpdateType } from '../entities/print-html.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PrintHtmlManager extends _PostgreSqlManager<
  PrintHtml,
  PrintHtmlRelationType,
  PrintHtmlInsertType,
  PrintHtmlUpdateType,
  PrintHtmlSortType
> {
  constructor() {
    super(PrintHtml)
  }
}

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

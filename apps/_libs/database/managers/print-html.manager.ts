import { Injectable } from '@nestjs/common'
import { PrintHtml } from '../entities'
import {
  PrintHtmlInsertType,
  PrintHtmlRelationType,
  PrintHtmlSortType,
  PrintHtmlUpdateType,
} from '../entities/print-html.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

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

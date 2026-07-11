import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TemplateHtml } from '../entities'
import { TemplateHtmlInsertType, TemplateHtmlRelationType, TemplateHtmlSortType, TemplateHtmlUpdateType } from '../entities/template-html.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TemplateHtmlManager extends _PostgreSqlManager<
  TemplateHtml,
  TemplateHtmlRelationType,
  TemplateHtmlInsertType,
  TemplateHtmlUpdateType,
  TemplateHtmlSortType
> {
  constructor() {
    super(TemplateHtml)
  }
}

@Injectable()
export class TemplateHtmlRepository extends _PostgreSqlRepository<
  TemplateHtml,
  TemplateHtmlRelationType,
  TemplateHtmlInsertType,
  TemplateHtmlUpdateType,
  TemplateHtmlSortType
> {
  constructor(
    @InjectRepository(TemplateHtml)
    private templateHtmlRepository: Repository<TemplateHtml>
  ) {
    super(TemplateHtml, templateHtmlRepository)
  }
}

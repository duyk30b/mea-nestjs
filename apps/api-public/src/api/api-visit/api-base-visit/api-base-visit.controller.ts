import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto'
import { HasPermission } from '../../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/database/entities/permission.entity'
import { ApiBaseVisitService } from './api-base-visit.service'
import {
  VisitGetManyQuery,
  VisitGetOneQuery,
  VisitPaginationQuery,
} from './request/visit-get.query'

@ApiTags('Visit')
@ApiBearerAuth('access-token')
@Controller('visit')
export class ApiBaseVisitController {
  constructor(private readonly apiBaseVisitService: ApiBaseVisitService) {}

  @Get('pagination')
  @HasPermission(PermissionId.VISIT_READ)
  async pagination(@External() { oid }: TExternal, @Query() query: VisitPaginationQuery) {
    return await this.apiBaseVisitService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.VISIT_READ)
  async list(@External() { oid }: TExternal, @Query() query: VisitGetManyQuery) {
    return await this.apiBaseVisitService.getMany(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.VISIT_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: VisitGetOneQuery
  ) {
    return await this.apiBaseVisitService.getOne(oid, id, query)
  }
}

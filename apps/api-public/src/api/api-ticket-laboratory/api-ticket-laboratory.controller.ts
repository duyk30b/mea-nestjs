import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiTicketLaboratoryService } from './api-ticket-laboratory.service'
import {
  TicketLaboratoryGetOneQuery,
  TicketLaboratoryPaginationQuery,
} from './request'

@ApiTags('TicketLaboratory')
@ApiBearerAuth('access-token')
@Controller('ticket-laboratory')
export class ApiTicketLaboratoryController {
  constructor(private readonly apiTicketLaboratoryService: ApiTicketLaboratoryService) { }

  @Get('pagination')
  @IsUser()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketLaboratoryPaginationQuery
  ) {
    return await this.apiTicketLaboratoryService.pagination(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketLaboratoryGetOneQuery
  ) {
    return await this.apiTicketLaboratoryService.getOne(oid, id, query)
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketLaboratoryService } from './api-ticket-laboratory.service'
import {
  TicketLaboratoryGetOneQuery,
  TicketLaboratoryPaginationQuery,
  TicketLaboratoryUpdateResultBody,
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

  @Post('update-result')
  @HasPermission(PermissionId.TICKET_LABORATORY_RESULT)
  async updateResult(
    @External() { oid }: TExternal,
    @Body() body: TicketLaboratoryUpdateResultBody
  ) {
    return await this.apiTicketLaboratoryService.updateResult({
      oid,
      body,
    })
  }

  @Post(':id/cancel-result')
  @HasPermission(PermissionId.TICKET_LABORATORY_RESULT)
  async cancelResult(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ) {
    return await this.apiTicketLaboratoryService.cancelResult(
      oid,
      id
    )
  }
}

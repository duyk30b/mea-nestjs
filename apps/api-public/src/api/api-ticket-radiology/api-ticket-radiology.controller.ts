import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiTicketRadiologyAction } from './api-ticket-radiology.action'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'
import {
  TicketRadiologyCancelResultBody,
  TicketRadiologyGetOneQuery,
  TicketRadiologyPaginationQuery,
  TicketRadiologyPostQuery,
  TicketRadiologyUpdateResultBody,
} from './request'

@ApiTags('TicketRadiology')
@ApiBearerAuth('access-token')
@Controller('ticket-radiology')
export class ApiTicketRadiologyController {
  constructor(
    private readonly apiTicketRadiologyService: ApiTicketRadiologyService,
    private readonly apiTicketRadiologyAction: ApiTicketRadiologyAction
  ) { }

  @Get('pagination')
  @UserPermission()
  async pagination(@External() { oid }: TExternal, @Query() query: TicketRadiologyPaginationQuery) {
    return await this.apiTicketRadiologyService.pagination(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketRadiologyGetOneQuery
  ) {
    return await this.apiTicketRadiologyService.getOne(oid, id, query)
  }

  @Post('update-result/:id')
  @UserPermission(PermissionId.RADIOLOGY_UPDATE_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateResult(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketRadiologyUpdateResultBody,
    @Query() query: TicketRadiologyPostQuery,
    @UploadedFiles() files: FileUploadDto[]
  ) {
    return await this.apiTicketRadiologyAction.updateResult({
      oid,
      ticketRadiologyId: id,
      body,
      query,
      files,
    })
  }

  @Post('cancel-result/:id')
  @UserPermission(PermissionId.RADIOLOGY_CANCEL_RESULT)
  async cancelResultTicketRadiology(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TicketRadiologyCancelResultBody
  ) {
    return await this.apiTicketRadiologyAction.cancelResult({
      oid,
      ticketRadiologyId: id,
      body,
    })
  }
}

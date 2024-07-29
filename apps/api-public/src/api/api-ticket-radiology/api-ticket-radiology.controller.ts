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
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'
import {
  TicketRadiologyCreateBody,
  TicketRadiologyGetOneQuery,
  TicketRadiologyPaginationQuery,
  TicketRadiologyUpdateBody,
} from './request'

@ApiTags('TicketRadiology')
@ApiBearerAuth('access-token')
@Controller('ticket-radiology')
export class ApiTicketRadiologyController {
  constructor(private readonly apiTicketRadiologyService: ApiTicketRadiologyService) { }

  @Get('pagination')
  @IsUser()
  async pagination(@External() { oid }: TExternal, @Query() query: TicketRadiologyPaginationQuery) {
    return await this.apiTicketRadiologyService.pagination(oid, query)
  }

  @Get('detail/:id')
  @IsUser()
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketRadiologyGetOneQuery
  ) {
    return await this.apiTicketRadiologyService.getOne(oid, id, query)
  }

  @Post('create-completed')
  @HasPermission(PermissionId.TICKET_RADIOLOGY_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async createTicketRadiologyCompleted(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Body() body: TicketRadiologyCreateBody
  ) {
    return await this.apiTicketRadiologyService.createCompleted({
      oid,
      body,
      files,
    })
  }

  @Post(':id/update-result')
  @HasPermission(PermissionId.TICKET_RADIOLOGY_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateResult(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: TicketRadiologyUpdateBody
  ) {
    return await this.apiTicketRadiologyService.updateResult({
      oid,
      ticketRadiologyId: id,
      body,
      files,
    })
  }

  @Post(':id/cancel-result')
  @HasPermission(PermissionId.TICKET_LABORATORY_RESULT)
  async cancelResult(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ) {
    return await this.apiTicketRadiologyService.cancelResult(
      oid,
      id
    )
  }
}

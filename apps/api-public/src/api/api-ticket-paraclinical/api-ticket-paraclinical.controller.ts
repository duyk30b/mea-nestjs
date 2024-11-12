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
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiTicketParaclinicalService } from './api-ticket-paraclinical.service'
import { TicketParaclinicalGetOneQuery, TicketParaclinicalPaginationQuery } from './request'
import {
  TicketParaclinicalCreateBody,
  TicketParaclinicalUpdateBody,
} from './request/ticket-paraclinical-upsert.body'

@ApiTags('TicketParaclinical')
@ApiBearerAuth('access-token')
@Controller('ticket-paraclinical')
export class ApiTicketParaclinicalController {
  constructor(private readonly apiTicketParaclinicalService: ApiTicketParaclinicalService) { }

  @Get('pagination')
  @HasPermission(PermissionId.TICKET_PARACLINICAL_READ)
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TicketParaclinicalPaginationQuery
  ) {
    return await this.apiTicketParaclinicalService.pagination(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.TICKET_PARACLINICAL_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TicketParaclinicalGetOneQuery
  ) {
    return await this.apiTicketParaclinicalService.getOne(oid, id, query)
  }

  @Post('create-completed')
  @HasPermission(PermissionId.TICKET_PARACLINICAL_CREATE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async createTicketParaclinicalCompleted(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Body() body: TicketParaclinicalCreateBody
  ) {
    return await this.apiTicketParaclinicalService.createCompleted({
      oid,
      body,
      files,
    })
  }

  @Post('update/:id')
  @HasPermission(PermissionId.TICKET_PARACLINICAL_UPDATE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateTicketParaclinical(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: TicketParaclinicalUpdateBody
  ) {
    return await this.apiTicketParaclinicalService.update({
      oid,
      ticketParaclinicalId: id,
      body,
      files,
    })
  }
}

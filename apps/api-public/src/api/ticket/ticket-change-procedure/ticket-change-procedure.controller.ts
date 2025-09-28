import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto } from '../../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse, FastifyFilesInterceptor } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { TicketParams } from '../ticket-query/request'
import {
  TicketChangeProcedureParams,
  TicketChangeRegimenParams,
  TicketProcessResultTicketProcedureBody,
  TicketUpdateMoneyTicketProcedureBody,
  TicketUpdateMoneyTicketRegimenBody,
  TicketUpdateUserRequestTicketRegimenBody,
  TicketUpdateUserTicketProcedureBody,
} from './request'
import { TicketAddTicketProcedureListBody } from './request/ticket-add-ticket-procedure-list.body'
import { TicketAddTicketProcedureListService } from './service/ticket-add-ticket-procedure-list.service'
import { TicketChangeProcedureService } from './service/ticket-change-procedure.service'
import { TicketChangeRegimenService } from './service/ticket-change-regimen.service'
import { TicketDestroyTicketProcedureService } from './service/ticket-destroy-ticket-procedure.service'
import { TicketDestroyTicketRegimenService } from './service/ticket-destroy-ticket-regimen.service'
import { TicketProcessResultTicketProcedureService } from './service/ticket-process-result-ticket-procedure.service'
import { TicketUpdateUserTicketProcedureService } from './service/ticket-update-user-ticket-procedure.service'

@ApiTags('Ticket')
@ApiBearerAuth('access-token')
@Controller('ticket')
export class TicketChangeProcedureController {
  constructor(
    private readonly ticketAddTicketProcedureListService: TicketAddTicketProcedureListService,
    private readonly ticketChangeProcedureService: TicketChangeProcedureService,
    private readonly ticketUpdateUserTicketProcedureService: TicketUpdateUserTicketProcedureService,
    private readonly ticketChangeRegimenService: TicketChangeRegimenService,
    private readonly ticketProcessResultTicketProcedureService: TicketProcessResultTicketProcedureService,
    private readonly ticketDestroyTicketProcedureService: TicketDestroyTicketProcedureService,
    private readonly ticketDestroyTicketRegimenService: TicketDestroyTicketRegimenService
  ) { }

  @Post(':ticketId/procedure/add-ticket-procedure-list')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async addTicketProcedureList(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketAddTicketProcedureListBody
  ): Promise<BaseResponse> {
    const data = await this.ticketAddTicketProcedureListService.addTicketProcedureList({
      oid,
      ticketId,
      body,
    })
    return { data }
  }

  @Delete(':ticketId/procedure/destroy-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async destroyTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams
  ): Promise<BaseResponse> {
    const data = await this.ticketDestroyTicketProcedureService.destroyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-money-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateMoneyTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketUpdateMoneyTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeProcedureService.updateMoneyTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-user-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateUserTicketProcedure(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams,
    @Body() body: TicketUpdateUserTicketProcedureBody
  ): Promise<BaseResponse> {
    const data = await this.ticketUpdateUserTicketProcedureService.updateUserTicketProcedure({
      oid,
      ticketId,
      ticketProcedureId,
      body,
    })
    return { data }
  }

  @Delete(':ticketId/procedure/destroy-ticket-regimen/:ticketRegimenId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async destroyTicketRegimen(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRegimenId }: TicketChangeRegimenParams
  ): Promise<BaseResponse> {
    const data = await this.ticketDestroyTicketRegimenService.destroyTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-money-ticket-regimen/:ticketRegimenId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateMoneyTicketRegimen(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRegimenId }: TicketChangeRegimenParams,
    @Body() body: TicketUpdateMoneyTicketRegimenBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeRegimenService.updateMoneyTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/update-user-request-ticket-regimen/:ticketRegimenId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_REQUEST)
  async updateUserTicketRegimen(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketRegimenId }: TicketChangeRegimenParams,
    @Body() body: TicketUpdateUserRequestTicketRegimenBody
  ): Promise<BaseResponse> {
    const data = await this.ticketChangeRegimenService.updateUserRequestTicketRegimen({
      oid,
      ticketId,
      ticketRegimenId,
      body,
    })
    return { data }
  }

  @Post(':ticketId/procedure/process-result-ticket-procedure')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_RESULT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async processResultTicketProcedureNormal(
    @External() { oid }: TExternal,
    @Param() { ticketId }: TicketParams,
    @Body() body: TicketProcessResultTicketProcedureBody,
    @UploadedFiles() files: FileUploadDto[]
  ): Promise<BaseResponse> {
    const data = await this.ticketProcessResultTicketProcedureService.processResultTicketProcedure({
      oid,
      ticketId,
      body,
      files,
    })
    return { data }
  }

  @Post(':ticketId/procedure/cancel-result-ticket-procedure/:ticketProcedureId')
  @UserPermission(PermissionId.TICKET_CHANGE_PROCEDURE_RESULT)
  async cancelResultTicketProcedureItem(
    @External() { oid }: TExternal,
    @Param() { ticketId, ticketProcedureId }: TicketChangeProcedureParams
  ): Promise<BaseResponse> {
    const data = await this.ticketProcessResultTicketProcedureService.processResultTicketProcedure({
      oid,
      ticketId,
      body: {
        ticketProcedureResult: {
          ticketProcedureId,
          quantity: 0,
          completedAt: null,
          result: '',
        },
        ticketUserResultList: [],
        ticketProductProcedureResultList: [],
        imagesChange: { externalUrlList: [], imageIdWaitList: [] },
        files: [],
      },
      files: [],
    })
    return { data }
  }
}

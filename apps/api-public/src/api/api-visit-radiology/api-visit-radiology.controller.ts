import { Body, Controller, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiVisitRadiologyService } from './api-visit-radiology.service'
import { VisitRadiologyCreateBody, VisitRadiologyUpdateBody } from './request'

@ApiTags('VisitRadiology')
@ApiBearerAuth('access-token')
@Controller('visit-radiology')
export class ApiVisitRadiologyController {
  constructor(private readonly apiVisitRadiologyService: ApiVisitRadiologyService) {}

  @Post('create')
  @HasPermission(PermissionId.VISIT_RADIOLOGY_UPSERT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async create(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Body() body: VisitRadiologyCreateBody
  ) {
    return await this.apiVisitRadiologyService.createOne({ oid, body, files })
  }

  @Post('update/:id')
  @HasPermission(PermissionId.VISIT_RADIOLOGY_UPSERT)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async update(
    @External() { oid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Param() { id }: IdParam,
    @Body() body: VisitRadiologyUpdateBody
  ) {
    return await this.apiVisitRadiologyService.updateOne({ oid, body, files, id })
  }
}

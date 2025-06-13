import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto, SingleFileUpload } from '../../../../_libs/common/dto/file'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiFileICDUploadExcel } from './api-file-icd.upload-excel'

@ApiTags('FileICD')
@ApiBearerAuth('access-token')
@Controller('file-icd')
export class ApiFileICDController {
  constructor(private readonly apiFileICDUploadExcel: ApiFileICDUploadExcel) { }

  @Post('upload-excel')
  @IsRoot()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async uploadExcel(
    @External() { uid, oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: SingleFileUpload
  ) {
    return await this.apiFileICDUploadExcel.uploadExcel({ oid, userId: uid, file })
  }
}

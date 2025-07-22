import { Body, Controller, Get, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse, FastifyFilesInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiMeService } from './api-me.service'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@ApiTags('Me')
@ApiBearerAuth('access-token')
@Controller('me')
export class ApiMeController {
  constructor(private readonly apiUserService: ApiMeService) { }

  @Get('data')
  @UserPermission()
  async data(@External() { oid, uid, permissionIds }: TExternal): Promise<BaseResponse> {
    const data = await this.apiUserService.data({ oid, uid, permissionIds })
    return { data }
  }

  @Get('info')
  @UserPermission()
  async info(@External() { oid, uid, permissionIds }: TExternal): Promise<BaseResponse> {
    const data = await this.apiUserService.info({ oid, uid, permissionIds })
    return { data }
  }

  @Patch('change-password')
  @UserPermission()
  async detail(
    @External() { oid, uid }: TExternal,
    @Body() body: UserChangePasswordBody
  ): Promise<BaseResponse> {
    const data = await this.apiUserService.changePassword(oid, uid, body)
    return { data }
  }

  @Post('update-info')
  @UserPermission()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFilesInterceptor('files', 10, {}))
  async updateInfo(
    @External() { oid, uid }: TExternal,
    @UploadedFiles() files: FileUploadDto[],
    @Body() body: UserUpdateInfoBody
  ): Promise<BaseResponse> {
    const data = await this.apiUserService.updateInfo({ oid, userId: uid, files, body })
    return { data }
  }
}

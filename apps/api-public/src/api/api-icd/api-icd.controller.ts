import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { ApiICDService } from './api-icd.service'
import { ICDReplaceAllBody } from './request'

@ApiTags('ICD')
@ApiBearerAuth('access-token')
@Controller('icd')
export class ApiICDController {
  constructor(private readonly apiICDService: ApiICDService) { }

  @Get('all')
  @UserPermission()
  getAll() {
    return this.apiICDService.getAll()
  }

  @Post('replace-all')
  @IsRoot()
  list(@Body() body: ICDReplaceAllBody) {
    return this.apiICDService.replaceAll(body)
  }
}

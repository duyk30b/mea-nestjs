import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { ApiAddressService } from './api-address.service'
import { PositionReplaceAllBody } from './request'

@ApiTags('Address')
@ApiBearerAuth('access-token')
@Controller('address')
export class ApiAddressController {
  constructor(private readonly apiAddressService: ApiAddressService) { }

  @Get('all')
  @UserPermission()
  getAll() {
    return this.apiAddressService.getAll()
  }

  @Put('replace-all')
  @IsRoot()
  list(@Body() body: PositionReplaceAllBody) {
    return this.apiAddressService.replaceAll(body)
  }
}

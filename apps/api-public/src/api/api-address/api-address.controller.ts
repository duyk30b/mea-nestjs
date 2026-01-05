import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { ApiAddressService } from './api-address.service'
import { AddressReplaceAllBody } from './request'

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

  @Post('replace-all')
  @IsRoot()
  list(@Body() body: AddressReplaceAllBody) {
    return this.apiAddressService.replaceAll(body)
  }
}

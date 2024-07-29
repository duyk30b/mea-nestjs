import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiProductExcel } from './api-product.excel'
import { ApiProductService } from './api-product.service'
import {
  ProductCreateBody,
  ProductGetManyQuery,
  ProductGetOneQuery,
  ProductPaginationQuery,
  ProductUpdateBody,
} from './request'

@ApiTags('Product')
@ApiBearerAuth('access-token')
@Controller('product')
export class ApiProductController {
  constructor(
    private readonly apiProductService: ApiProductService,
    private readonly apiProductExcel: ApiProductExcel
  ) { }

  @Get('pagination')
  @HasPermission(PermissionId.PRODUCT_READ)
  pagination(@External() { oid }: TExternal, @Query() query: ProductPaginationQuery) {
    return this.apiProductService.pagination(oid, query)
  }

  @Get('list')
  @HasPermission(PermissionId.PRODUCT_READ)
  async list(@External() { oid }: TExternal, @Query() query: ProductGetManyQuery) {
    return await this.apiProductService.getList(oid, query)
  }

  @Get('detail/:id')
  @HasPermission(PermissionId.PRODUCT_READ)
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ProductGetOneQuery
  ) {
    return await this.apiProductService.getOne(oid, id, query)
  }

  @Post('create')
  @HasPermission(PermissionId.PRODUCT_CREATE)
  async create(@External() { oid }: TExternal, @Body() body: ProductCreateBody) {
    return await this.apiProductService.createOne(oid, body)
  }

  @Patch('update/:id')
  @HasPermission(PermissionId.PRODUCT_UPDATE)
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProductUpdateBody
  ) {
    return await this.apiProductService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @HasPermission(PermissionId.PRODUCT_DELETE)
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid, organization }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProductService.destroyOne({ organization, oid, productId: id })
  }

  @Get('download-excel')
  @HasPermission(PermissionId.PRODUCT_DOWNLOAD_EXCEL)
  async downloadExcel(@External() { user, organization }: TExternal) {
    return await this.apiProductExcel.downloadExcel({ organization, user })
  }
}

import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { External, TExternal } from '../../common/request-external'
import { ApiProductMovementService } from './api-product-movement.service'
import { ProductMovementPaginationQuery } from './request'

@ApiTags('Product Movement')
@ApiBearerAuth('access-token')
@Controller('product-movement')
export class ApiProductMovementController {
	constructor(private readonly apiProductMovementService: ApiProductMovementService) { }

	@Get('pagination')
	pagination(@External() { oid }: TExternal, @Query() query: ProductMovementPaginationQuery) {
		return this.apiProductMovementService.pagination(oid, query)
	}
}

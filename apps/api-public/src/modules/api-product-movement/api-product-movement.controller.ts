import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiProductMovementService } from './api-product-movement.service'
import { ProductMovementPaginationQuery } from './request'

@ApiTags('Product Movement')
@ApiBearerAuth('access-token')
@Controller('product-movement')
export class ApiProductMovementController {
	constructor(private readonly apiProductMovementService: ApiProductMovementService) { }

	@Get('pagination')
	pagination(@OrganizationId() oid: number, @Query() query: ProductMovementPaginationQuery) {
		return this.apiProductMovementService.pagination(oid, query)
	}
}

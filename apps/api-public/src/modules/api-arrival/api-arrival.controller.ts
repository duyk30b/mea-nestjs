import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { TExternal, External } from '../../common/request-external'
import { ApiArrivalService } from './api-arrival.service'
import { ArrivalGetOneQuery, ArrivalPaginationQuery } from './request'

@ApiTags('Arrival')
@ApiBearerAuth('access-token')
@Controller('arrival')
export class ApiArrivalController {
    constructor(private readonly apiArrivalService: ApiArrivalService) {}

    @Get('pagination')
    async pagination(@External() { oid }: TExternal, @Query() query: ArrivalPaginationQuery) {
        // return await this.apiArrivalService.pagination(oid, query)
    }

    @Get('detail/:id')
    async detail(@External() { oid }: TExternal, @Param() { id }: IdParam, @Query() query: ArrivalGetOneQuery) {
        // return await this.apiArrivalService.getOne(oid, id, query)
    }
}

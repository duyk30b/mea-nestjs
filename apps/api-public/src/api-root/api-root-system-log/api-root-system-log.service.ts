import { Injectable, Logger } from '@nestjs/common'
import { SystemLogRepository } from '../../../../_libs/mongo/collections/system-log/system-log.repository'
import { RootSystemLogPaginationQuery } from './request'

@Injectable()
export class ApiRootSystemLogService {
  private logger = new Logger(ApiRootSystemLogService.name)

  constructor(private readonly systemLogRepository: SystemLogRepository) { }

  async pagination(query: RootSystemLogPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data: systemLogList, total } = await this.systemLogRepository.pagination({
      page,
      limit,
      condition: {
        oid: filter?.oid,
        uid: filter?.uid,
        clientId: filter?.clientId,
        apiMethod: filter?.apiMethod as any,
        prefixController: filter?.prefixController,
        url: filter?.url,
        errorName: filter?.errorName,
        errorMessage: filter?.errorMessage,
        statusCode: filter?.statusCode,
        createdAt: filter.createdAt,
        $OR: filter.$OR,
        $AND: filter.$AND,
      },
      sort,
    })

    return {
      systemLogList,
      page,
      limit,
      total,
    }
  }
}

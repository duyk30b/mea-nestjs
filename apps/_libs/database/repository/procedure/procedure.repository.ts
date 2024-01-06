import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { InvoiceItemType } from '../../common/variable'
import { InvoiceItem, Procedure } from '../../entities'
import { BaseSqlRepository } from '../base-sql.repository'

@Injectable()
export class ProcedureRepository extends BaseSqlRepository<Procedure> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Procedure) private procedureRepository: Repository<Procedure>
    ) {
        super(procedureRepository)
    }
}

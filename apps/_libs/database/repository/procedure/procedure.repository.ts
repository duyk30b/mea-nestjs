import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, UpdateResult } from 'typeorm'
import { NoExtraProperties } from '../../../common/helpers/typescript.helper'
import { InvoiceItemType } from '../../common/variable'
import { InvoiceItem, Procedure } from '../../entities'
import { BaseRepository } from '../base.repository'

@Injectable()
export class ProcedureRepository extends BaseRepository<Procedure> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Procedure) private procedureRepository: Repository<Procedure>
    ) {
        super(procedureRepository)
    }

    async delete(oid: number, procedureId: number) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const numberInvoiceItem = await manager.count(InvoiceItem, {
                where: {
                    oid,
                    referenceId: procedureId,
                    type: InvoiceItemType.Procedure,
                },
            })
            if (numberInvoiceItem > 0) {
                // nếu đã có đơn hàng thì chỉ có thể xóa mềm
                const updateResult = await manager.update(
                    Procedure,
                    {
                        oid,
                        id: procedureId,
                    },
                    { deletedAt: Date.now() }
                )
                if (updateResult.affected !== 1) {
                    throw new Error('Xóa dịch vụ thất bại')
                }
            } else {
                // nếu chưa có đơn nào có thể xóa cứng
                const deleteResult = await manager.delete(Procedure, {
                    oid,
                    id: procedureId,
                })
                if (deleteResult.affected !== 1) {
                    throw new Error('Xóa dịch vụ thất bại')
                }
            }
        })
    }
}

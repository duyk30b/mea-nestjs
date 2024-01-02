import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Distributor, Receipt } from '../../entities'
import { BaseRepository } from '../base.repository'

@Injectable()
export class DistributorRepository extends BaseRepository<
    Distributor,
    { [P in 'id' | 'debt' | 'fullName']?: 'ASC' | 'DESC' },
    { [P in 'invoice']?: boolean }
> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Distributor) private distributorRepository: Repository<Distributor>
    ) {
        super(distributorRepository)
    }

    async delete(oid: number, distributorId: number) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const numberReceipt = await manager.count(Receipt, {
                where: { distributorId, oid },
            })
            if (numberReceipt > 0) {
                // nếu đã có phiếu nhập thì chỉ có thể xóa mềm
                const updateResult = await manager.update(
                    Distributor,
                    {
                        oid,
                        id: distributorId,
                        debt: 0,
                    },
                    { deletedAt: Date.now() }
                )
                if (updateResult.affected !== 1) {
                    throw new Error('Xóa nhà cung cấp thất bại')
                }
            } else {
                // nếu nhà cung cấp này chưa có phiếu nào có thể xóa cứng
                const deleteResult = await manager.delete(Distributor, {
                    oid,
                    id: distributorId,
                    debt: 0,
                })
                if (deleteResult.affected !== 1) {
                    throw new Error('Xóa nhà cung cấp thất bại')
                }
            }
        })
    }
}

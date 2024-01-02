import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Customer, Invoice } from '../../entities'
import { BaseRepository } from '../base.repository'

@Injectable()
export class CustomerRepository extends BaseRepository<
    Customer,
    { [P in 'id' | 'debt' | 'fullName']?: 'ASC' | 'DESC' },
    { [P in 'invoice']?: boolean }
> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Customer) private customerRepository: Repository<Customer>
    ) {
        super(customerRepository)
    }

    async delete(oid: number, customerId: number) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const numberInvoice = await manager.count(Invoice, {
                where: { customerId, oid },
            })
            if (numberInvoice > 0) {
                // nếu đã có đơn hàng thì chỉ có thể xóa mềm
                const updateResult = await manager.update(
                    Customer,
                    {
                        oid,
                        id: customerId,
                        debt: 0,
                    },
                    { deletedAt: Date.now() }
                )
                if (updateResult.affected !== 1) {
                    throw new Error('Xóa khách hàng thất bại')
                }
            } else {
                // nếu khách hàng này chưa có đơn gì có thể xóa cứng
                const deleteResult = await manager.delete(Customer, {
                    oid,
                    id: customerId,
                    debt: 0,
                })
                if (deleteResult.affected !== 1) {
                    throw new Error('Xóa khách hàng thất bại')
                }
            }
        })
    }
}

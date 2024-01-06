import { Injectable, Logger } from '@nestjs/common'
import { OrganizationSettingType } from '../../../../_libs/database/entities/organization-setting.entity'
import {
    CustomerRepository,
    DistributorRepository,
    OrganizationRepository,
} from '../../../../_libs/database/repository'
import { OrganizationSettingUpdateBody } from './request/organization-settings.request'
import { OrganizationUpdateBody } from './request/organization-update.body'

@Injectable()
export class ApiOrganizationService {
    private logger = new Logger(ApiOrganizationService.name)

    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly distributorRepository: DistributorRepository,
        private readonly customerRepository: CustomerRepository
    ) {}

    async info(id: number) {
        const [organization, allSettings] = await Promise.all([
            this.organizationRepository.findOneById(id),
            this.organizationRepository.getAllSetting(id),
        ])
        const settings: Record<string, string> = {}
        allSettings.forEach((i) => (settings[i.type] = i.data))

        let distributorDefault: any
        let customerDefault: any
        try {
            const screenReceipt = JSON.parse(settings[OrganizationSettingType.SCREEN_RECEIPT_UPSERT] || '{}')
            const screenInvoice = JSON.parse(settings[OrganizationSettingType.SCREEN_INVOICE_UPSERT] || '{}')

            const distributorId = screenReceipt.distributor?.idDefault
            const customerId = screenInvoice.customer?.idDefault

            const data = await Promise.all([
                distributorId ? this.distributorRepository.findOneBy({ oid: id, id: distributorId }) : {},
                customerId ? this.customerRepository.findOneBy({ oid: id, id: customerId }) : {},
            ])
            distributorDefault = data[0]
            customerDefault = data[1]
        } catch (error) {
            this.logger.error(error)
        }

        return { organization, settings, distributorDefault, customerDefault }
    }

    async updateOne(id: number, body: OrganizationUpdateBody) {
        await this.organizationRepository.update({ id }, body)
        return await this.organizationRepository.findOneById(id)
    }

    async upsertSetting(oid: number, type: OrganizationSettingType, body: OrganizationSettingUpdateBody) {
        return await this.organizationRepository.upsertSetting(oid, type, body.data)
    }
}

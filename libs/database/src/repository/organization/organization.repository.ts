import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { OrganizationSettingType } from '_libs/database/entities/organization-setting.entity'
import { FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm'
import { Organization, OrganizationSetting } from '../../entities'
import { OrganizationCondition } from './organization.dto'

@Injectable()
export class OrganizationRepository {
    constructor(
        @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationSetting)
        private organizationSettingRepository: Repository<OrganizationSetting>
    ) {}

    getWhereOptions(condition: OrganizationCondition) {
        const where: FindOptionsWhere<Organization> = {}
        if (condition.id != null) where.id = condition.id
        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }
        return where
    }

    async findOne(oid: number): Promise<Organization> {
        return await this.organizationRepository.findOne({ where: { id: oid } })
    }

    async findMany(condition: OrganizationCondition): Promise<Organization[]> {
        const where = this.getWhereOptions(condition)
        return await this.organizationRepository.find({ where })
    }

    async update<T extends Partial<Organization>>(
        oid: number,
        dto: NoExtraProperties<Partial<Omit<Organization, 'id' | 'phone'>>, T>
    ): Promise<UpdateResult> {
        return await this.organizationRepository.update({ id: oid }, dto)
    }

    async getAllSetting(oid: number) {
        return await this.organizationSettingRepository.find({
            select: { type: true, data: true },
            where: { oid },
        })
    }

    async getSettings(oid: number, types: OrganizationSettingType[]) {
        return await this.organizationSettingRepository.find({
            select: { type: true, data: true },
            where: { oid, type: In(types) },
        })
    }

    async upsertSetting(oid: number, type: OrganizationSettingType, data: string) {
        const dto = this.organizationSettingRepository.create({ oid, type, data })
        return await this.organizationSettingRepository
            .createQueryBuilder()
            .insert()
            .into(OrganizationSetting)
            .values(dto)
            .orUpdate(['data'], 'IDX_CLINIC_SETTING_TYPE')
            .execute()
    }
}

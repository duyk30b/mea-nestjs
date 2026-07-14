import { CustomerSourceModule } from '@api-public/api/master-data/customer_source/customer_source.module'
import { ProcedureGroupModule } from '@api-public/api/master-data/procedure_group/procedure-group.module'
import { ProductGroupModule } from '@api-public/api/master-data/product_group/product-group.module'
import { Module } from '@nestjs/common'
import { AttributeModule } from './attribute/attribute.module'
import { CustomerGroupModule } from './customer_group/customer_group.module'
import { DiscountModule } from './discount/discount.module'
import { LaboratoryGroupModule } from './laboratory-group/laboratory-group.module'
import { LaboratoryModule } from './laboratory/laboratory.module'
import { PositionModule } from './position/position.module'
import { PrintSettingModule } from './print-setting/print-setting.module'
import { ProcedureModule } from './procedure/procedure.module'
import { RadiologyGroupModule } from './radiology-group/radiology-group.module'
import { RadiologyModule } from './radiology/radiology.module'
import { RegimenModule } from './regimen/api-regimen.module'
import { RoomModule } from './room/room.module'
import { SurchargeModule } from './surcharge/surcharge.module'
import { TemplateHtmlModule } from './template-html/template-html.module'

@Module({
  imports: [
    AttributeModule,
    CustomerGroupModule,
    CustomerSourceModule,
    DiscountModule,
    LaboratoryModule,
    LaboratoryGroupModule,
    PositionModule,
    PrintSettingModule,
    ProcedureModule,
    ProcedureGroupModule,
    ProductGroupModule,
    RadiologyModule,
    RadiologyGroupModule,
    RegimenModule,
    RoomModule,
    SurchargeModule,
    TemplateHtmlModule,
  ],
  controllers: [],
  providers: [],
})
export class MasterDataModule { }

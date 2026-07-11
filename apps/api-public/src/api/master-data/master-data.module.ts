import { Module } from '@nestjs/common'
import { AttributeModule } from './attribute/attribute.module'
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
    TemplateHtmlModule,
    PrintSettingModule,
    AttributeModule,
    DiscountModule,
    LaboratoryModule,
    LaboratoryGroupModule,
    PositionModule,
    LaboratoryGroupModule,
    ProcedureModule,
    RadiologyModule,
    RadiologyGroupModule,
    RegimenModule,
    SurchargeModule,
    RoomModule,
  ],
  controllers: [],
  providers: [],
})
export class MasterDataModule { }

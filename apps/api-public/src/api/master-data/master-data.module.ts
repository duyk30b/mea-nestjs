import { Module } from '@nestjs/common'
import { DiscountModule } from './discount/discount.module'
import { LaboratoryGroupModule } from './laboratory-group/laboratory-group.module'
import { LaboratoryModule } from './laboratory/laboratory.module'
import { PositionModule } from './position/position.module'
import { ProcedureModule } from './procedure/procedure.module'
import { RadiologyGroupModule } from './radiology-group/radiology-group.module'
import { RadiologyModule } from './radiology/radiology.module'
import { RegimenModule } from './regimen/api-regimen.module'

@Module({
  imports: [
    DiscountModule,
    LaboratoryModule,
    LaboratoryGroupModule,
    PositionModule,
    LaboratoryGroupModule,
    ProcedureModule,
    RadiologyModule,
    RadiologyGroupModule,
    RegimenModule,
  ],
  controllers: [],
  providers: [],
})
export class MasterDataModule { }

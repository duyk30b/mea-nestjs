import { Module } from '@nestjs/common'
import { ApiICDController } from './api-icd.controller'
import { ApiICDService } from './api-icd.service'

@Module({
  imports: [],
  controllers: [ApiICDController],
  providers: [ApiICDService],
})
export class ApiICDModule { }

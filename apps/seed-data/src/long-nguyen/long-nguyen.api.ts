import { Controller } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'

@ApiTags('LongNguyen Data')
@ApiBearerAuth('access-token')
@Controller('long-nguyen')
export class LongNguyenApi {
  constructor(@InjectEntityManager() private manager: EntityManager) {}

  // @Get('start')
  // async startSeedData() {
  //     const startDate = Date.now()
  //     console.log('======== [START]: Seed data ========')
  //     const oid = 3

  //     console.log('🚀 ======== SEED: organization config ========')
  //     const orgProductGroupSetting = this.manager.create(OrganizationSetting, {
  //         oid,
  //         type: ScreenSettingKey.PRODUCT_GROUP,
  //         data: JSON.stringify(productGroupExampleData),
  //     })
  //     await this.manager.save(OrganizationSetting, orgProductGroupSetting)

  //     console.log('🚀 ======== SEED: product ========')
  //     const productsSnap = productExampleData.map((item) => {
  //         const snap = new Product()
  //         snap.oid = oid
  //         snap.brandName = item.brandName
  //         snap.substance = item.substance
  //         snap.group = Object.keys(productGroupExampleData).find((i) => productGroupExampleData[i] === item.group)
  //         snap.unit = [{ name: item.unit, rate: 1 }]
  //         snap.route = item.route
  //         snap.source = item.source
  //         snap['costPrice'] = item.costPrice
  //         snap['expiryDate'] = item.expiryDate
  //         snap['retailPrice'] = item.retailPrice
  //         return snap
  //     })
  //     const products = await this.manager.save(productsSnap)

  //     const productBatchListSnap = products.map((item) => {
  //         const productBatch = new ProductBatch()
  //         productBatch.oid = oid
  //         productBatch.productId = item.id
  //         productBatch.expiryDate = item['expiryDate']
  //         productBatch.costPrice = (item['costPrice'] || 0) * 1000
  //         productBatch.retailPrice = (item['retailPrice'] || 0) * 1000
  //         productBatch.wholesalePrice = (item['wholesalePrice'] || 0) * 1000

  //         return productBatch
  //     })
  //     await this.manager.save(productBatchListSnap)

  //     const endDate = Date.now()
  //     const time = endDate - startDate
  //     console.log(`======== [SUCCESS] - ${time}ms ========`)
  //     return { time }
  // }
}

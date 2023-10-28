import { Injectable } from '@nestjs/common'

@Injectable()
export class InvoiceSeed {
  // constructor(
  //     @InjectRepository(ProductBatch) private productBatchRepository: Repository<ProductBatch>,
  //     @InjectRepository(Customer) private customerRepository: Repository<Customer>,
  //     @InjectRepository(Procedure) private procedureRepository: Repository<Procedure>,
  //     private readonly invoiceQuickRepository: InvoiceQuickRepository
  // ) { }
  // fakeInvoiceDraftInsertDto(productBatches: ProductBatch[], procedures: Procedure[]): InvoiceDraftInsertDto {
  //     const numberProductBatch = randomNumber(2, 5)
  //     const numberProcedure = randomNumber(2, 5)
  //     const invoiceItemsDto: InvoiceItemDto[] = []
  //     for (let i = 0; i < numberProductBatch; i++) {
  //         const productBatch = productBatches[i]
  //         const unit = productBatch.product.unit.find((i) => i.rate === 1)
  //         const expectedPrice = productBatch.retailPrice
  //         const discountPercent = randomNumber(10, 30)
  //         const discountMoney = Math.ceil(expectedPrice * discountPercent / 100 / 1000) * 1000
  //         const discountType = randomEnum<DiscountType>(DiscountType)
  //         const actualPrice = expectedPrice - discountMoney
  //         invoiceItemsDto.push({
  //             referenceId: productBatch.id,
  //             type: InvoiceItemType.ProductBatch,
  //             unit,
  //             costPrice: productBatch.costPrice,
  //             expectedPrice,
  //             quantity: randomNumber(1, 5),
  //             actualPrice,
  //             discountMoney,
  //             discountPercent,
  //             discountType,
  //         })
  //     }
  //     for (let i = 0; i < numberProcedure; i++) {
  //         const procedure = procedures[i]
  //         const expectedPrice = procedure.price
  //         const discountPercent = randomNumber(10, 30)
  //         const discountMoney = Math.ceil(expectedPrice * discountPercent / 100 / 1000) * 1000
  //         const discountType = randomEnum<DiscountType>(DiscountType)
  //         const actualPrice = expectedPrice - discountMoney
  //         invoiceItemsDto.push({
  //             referenceId: procedure.id,
  //             type: InvoiceItemType.Procedure,
  //             unit: { name: '', rate: 1 },
  //             costPrice: 0,
  //             expectedPrice,
  //             quantity: randomNumber(1, 5),
  //             actualPrice,
  //             discountMoney,
  //             discountPercent,
  //             discountType,
  //         })
  //     }
  //     const itemsCostMoney = invoiceItemsDto.reduce((acc, cur) => acc += cur.quantity * cur.costPrice, 0)
  //     const itemsActualMoney = invoiceItemsDto.reduce((acc, cur) => acc += cur.quantity * cur.actualPrice, 0)
  //     const discountPercent = randomNumber(2, 10)
  //     const discountMoney = Math.ceil(itemsActualMoney * discountPercent / 100 / 1000) * 1000
  //     const discountType = randomEnum<DiscountType>(DiscountType)
  //     const surcharge = randomNumber(10_000, 100_0000, 10_000)
  //     const expense = randomNumber(5_000, 50_0000, 5_000)
  //     const totalMoney = itemsActualMoney - discountMoney + surcharge
  //     const profit = totalMoney - itemsCostMoney - expense
  //     const debt = Math.floor(totalMoney * randomNumber(0.1, 0.5, 0.1) / 1000) * 1000
  //     const invoiceInsertDto: InvoiceDraftInsertDto = {
  //         invoiceItems: invoiceItemsDto,
  //         itemsCostMoney,
  //         itemsActualMoney,
  //         discountMoney,
  //         discountPercent,
  //         discountType,
  //         surcharge,
  //         expense,
  //         totalMoney,
  //         profit,
  //         debt,
  //         note: faker.lorem.sentence(),
  //     }
  //     return invoiceInsertDto
  // }
  // async start(oid: number, number: number, startTime: Date, endTime: Date) {
  //     const productBatches = await this.productBatchRepository.find({
  //         relations: { product: true },
  //         relationLoadStrategy: 'join',
  //         where: { oid },
  //     })
  //     const procedures = await this.procedureRepository.findBy({ oid })
  //     const customers = await this.customerRepository.findBy({ oid })
  //     const gap = Math.ceil((endTime.getTime() - startTime.getTime()) / number)
  //     for (let i = 0; i < number; i++) {
  //         const customer = randomItemsInArray(customers)
  //         const productBatchesShuffle = shuffleArray(productBatches)
  //         const proceduresShuffle = shuffleArray(procedures)
  //         const createTime = startTime.getTime() + i * gap
  //         const paymentTime = startTime.getTime() + i * gap + 60 * 60 * 1000
  //         const shipTime = paymentTime
  //         const refundTime = startTime.getTime() + i * gap + 2 * 60 * 60 * 1000
  //         const invoiceInsertDto = this.fakeInvoiceDraftInsertDto(productBatchesShuffle, proceduresShuffle)
  //         invoiceInsertDto.createTime = createTime
  //         invoiceInsertDto.customerId = customer.id
  //         const { invoiceId } = await this.invoiceQuickRepository.createDraft({
  //             oid,
  //             invoiceInsertDto,
  //         })
  //         if (i % 2 === 0) {
  //             await this.invoiceQuickRepository.startShip({ oid, invoiceId, shipTime })
  //         }
  //         if (i % 3 === 0) {
  //             await this.invoiceQuickRepository.startPayment({
  //                 oid,
  //                 invoiceId,
  //                 paymentTime,
  //                 debt: invoiceInsertDto.debt,
  //             })
  //         }
  //         if (i % 6 === 0) {
  //             await this.invoiceQuickRepository.startRefund({ oid, invoiceId, refundTime })
  //         }
  //         // const createMultiDraft = await Promise.allSettled(Array.from(Array(300)).map((i, index) => {
  //         //     const dto = JSON.parse(JSON.stringify(invoiceInsertDto))
  //         //     const r = randomNumber(1, 1000, 1)
  //         //     dto.totalMoney = r
  //         //     dto.invoiceItems.forEach((item) => item.quantity = r)
  //         //     return this.invoiceQuickRepository.createInvoiceDraft(oid, dto, createTime)
  //         // }))
  //         // console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ createMultiDraft:', createMultiDraft)
  //         // const updateMultiDraft = await Promise.allSettled(Array.from(Array(200)).map((i, index) => {
  //         //     const dto = JSON.parse(JSON.stringify(invoiceInsertDto))
  //         //     const r = 10 + index
  //         //     dto.totalMoney = r
  //         //     dto.invoiceItems.forEach((item) => item.quantity = r)
  //         //     return this.invoiceQuickRepository.updateInvoiceDraft(oid, 201, dto)
  //         // }))
  //         // console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', updateMultiDraft)
  //         // const paymentMultiDraft = await Promise.allSettled(Array.from(Array(5)).map((i, index) => {
  //         //     return this.invoiceQuickRepository.paymentInvoiceDraft(oid, 3, 1234123)
  //         // }))
  //         // console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', paymentMultiDraft)
  //         // const refundMultiDraft = await Promise.allSettled(Array.from(Array(20)).map((i, index) => {
  //         //     return this.invoiceQuickRepository.refundInvoice(oid, 20, 1234123)
  //         // }))
  //         // console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', refundMultiDraft)
  //     }
  // }
}

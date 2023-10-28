import { MigrationInterface, QueryRunner } from 'typeorm'

export class version2411702201186540 implements MigrationInterface {
  name = 'version2411702201186540'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`ProductMovement\`
                ADD \`unit\` varchar(255) NOT NULL DEFAULT '{"name":"","rate":1}'
        `)
    await queryRunner.query(`
            ALTER TABLE \`InvoiceItem\`
                CHANGE \`unit\` \`unit\` varchar(255) NOT NULL DEFAULT '{"name":"","rate":1}'
        `)
    await queryRunner.query(`
            ALTER TABLE \`ReceiptItem\`
                ADD \`costPrice\` bigint NOT NULL DEFAULT '0',
                CHANGE \`unit\` \`unit\` varchar(255) NOT NULL DEFAULT '{"name":"","rate":1}'
        `)
    await queryRunner.query(`
            UPDATE ReceiptItem JOIN ProductBatch
                ON ReceiptItem.productBatchId = ProductBatch.id
            SET ReceiptItem.costPrice = ProductBatch.costPrice
        `)
    await queryRunner.query(`
            UPDATE ReceiptItem JOIN Receipt
                ON ReceiptItem.receiptId = Receipt.id
            SET ReceiptItem.distributorId = Receipt.distributorId
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 ~ file:  ~ down ~ queryRunner:', queryRunner)
  }
}

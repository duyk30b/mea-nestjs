import { MigrationInterface, QueryRunner } from 'typeorm'

export class HintPriceProduct1711162406981 implements MigrationInterface {
  name = 'HintPriceProduct1711162406981'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "Product"
            ADD "lastExpiryDate" bigint
        `)
    await queryRunner.query(`
            ALTER TABLE "Product"
            ADD "lastCostPrice" bigint NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "Product"
            ADD "lastWholesalePrice" bigint NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "Product"
            ADD "lastRetailPrice" bigint NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ProductBatch__oid_updatedAt"
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_ProductBatch__oid_updatedAt" ON "ProductBatch" ("oid", "updatedAt")
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ProductBatch__oid_updatedAt"
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_ProductBatch__oid_updatedAt" ON "ProductBatch" ("oid", "updatedAt")
        `)
    await queryRunner.query(`
            ALTER TABLE "Product" DROP COLUMN "lastRetailPrice"
        `)
    await queryRunner.query(`
            ALTER TABLE "Product" DROP COLUMN "lastWholesalePrice"
        `)
    await queryRunner.query(`
            ALTER TABLE "Product" DROP COLUMN "lastCostPrice"
        `)
    await queryRunner.query(`
            ALTER TABLE "Product" DROP COLUMN "lastExpiryDate"
        `)
  }
}

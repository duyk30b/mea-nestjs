import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveProductBatchIsActive1708521547103 implements MigrationInterface {
  name = 'RemoveProductBatchIsActive1708521547103'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "ProductBatch" DROP COLUMN "isActive"
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_ProductBatch__quantity" ON "ProductBatch" ("quantity")
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
            DROP INDEX "public"."IDX_ProductBatch__quantity"
        `)
    await queryRunner.query(`
            ALTER TABLE "ProductBatch"
            ADD "isActive" smallint NOT NULL DEFAULT '1'
        `)
  }
}

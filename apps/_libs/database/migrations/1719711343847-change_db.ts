import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDb1719711343847 implements MigrationInterface {
    name = 'ChangeDb1719711343847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Batch" DROP COLUMN "listPrice"
        `);
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem" DROP COLUMN "listPrice"
        `);
        await queryRunner.query(`
            ALTER TABLE "Batch"
            ADD "wholesalePrice" bigint NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "Batch"
            ADD "retailPrice" bigint NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
            ADD "wholesalePrice" bigint NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
            ADD "retailPrice" bigint NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_Batch__oid_updatedAt"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_Batch__oid_updatedAt" ON "Batch" ("oid", "updatedAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_Batch__oid_updatedAt"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_Batch__oid_updatedAt" ON "Batch" ("oid", "updatedAt")
        `);
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem" DROP COLUMN "retailPrice"
        `);
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem" DROP COLUMN "wholesalePrice"
        `);
        await queryRunner.query(`
            ALTER TABLE "Batch" DROP COLUMN "retailPrice"
        `);
        await queryRunner.query(`
            ALTER TABLE "Batch" DROP COLUMN "wholesalePrice"
        `);
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
            ADD "listPrice" bigint NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "Batch"
            ADD "listPrice" bigint NOT NULL DEFAULT '0'
        `);
    }

}

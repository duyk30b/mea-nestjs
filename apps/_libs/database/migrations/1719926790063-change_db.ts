import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDb1719926790063 implements MigrationInterface {
    name = 'ChangeDb1719926790063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Visit"
                RENAME COLUMN "visitType" TO "voucherType"
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
            ALTER TABLE "Visit"
                RENAME COLUMN "voucherType" TO "visitType"
        `);
    }

}

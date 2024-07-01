import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDb1719868103330 implements MigrationInterface {
    name = 'ChangeDb1719868103330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Procedure" DROP COLUMN "consumableHint"
        `);
        await queryRunner.query(`
            ALTER TABLE "VisitProduct"
            ADD "customerId" integer NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "VisitProduct"
            ADD "batchId" integer NOT NULL DEFAULT '0'
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
            ALTER TABLE "VisitProduct" DROP COLUMN "batchId"
        `);
        await queryRunner.query(`
            ALTER TABLE "VisitProduct" DROP COLUMN "customerId"
        `);
        await queryRunner.query(`
            ALTER TABLE "Procedure"
            ADD "consumableHint" text
        `);
    }

}

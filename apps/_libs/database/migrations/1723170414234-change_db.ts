import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDb1723170414234 implements MigrationInterface {
    name = 'ChangeDb1723170414234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Appointment"
                RENAME COLUMN "time" TO "registeredAt"
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
            ALTER TABLE "Appointment"
                RENAME COLUMN "registeredAt" TO "time"
        `);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDb1734651265259 implements MigrationInterface {
    name = 'ChangeDb1734651265259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_Batch__oid_updatedAt"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_Batch__oid_updatedAt" ON "Batch" ("oid", "updatedAt")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_Setting__oid_roleId_interactType_interactId" ON "Commission" ("oid", "roleId", "interactType", "interactId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_Setting__oid_roleId_interactType_interactId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_Batch__oid_updatedAt"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_Batch__oid_updatedAt" ON "Batch" ("oid", "updatedAt")
        `);
    }

}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version921752885392424 implements MigrationInterface {
    name = 'Version921752885392424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Room"
            ADD "roomCode" character varying(50) NOT NULL DEFAULT ''
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketProduct"
            ADD "printPrescription" smallint NOT NULL DEFAULT '1'
        `)

        await queryRunner.query(`
            DROP INDEX "public"."IDX_Organization__email";
            DROP INDEX "public"."IDX_Organization__phone";
            ALTER TABLE "Organization"
                ADD "organizationCode" character varying(50) NOT NULL DEFAULT '';
            UPDATE "Organization"
                SET "organizationCode" = "phone";
            ALTER TABLE "Organization"
                ALTER COLUMN "organizationCode" DROP DEFAULT;
            CREATE UNIQUE INDEX "IDX_Organization__organization_code" ON "Organization" ("organizationCode");
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

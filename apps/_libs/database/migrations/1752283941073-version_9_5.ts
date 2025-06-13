import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version951752283941073 implements MigrationInterface {
    name = 'Version951752283941073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Customer"
                ADD "customerCode" character varying(50) NOT NULL DEFAULT '';
            UPDATE      "Customer"  SET "customerCode" = "id";
            ALTER TABLE "Customer"
                ALTER COLUMN "customerCode" DROP DEFAULT;
            ALTER TABLE "Customer"
                ADD CONSTRAINT "UNIQUE_Customer__oid_customerCode" UNIQUE ("oid", "customerCode")
        `)

        await queryRunner.query(`
            CREATE TABLE "Room" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "roomInteractType" smallint NOT NULL DEFAULT '2',
                "isCommon" smallint NOT NULL DEFAULT '1',
                "showMenu" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_867d589be92524f89375e2e086d" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "RadiologySample" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "radiologyId" integer NOT NULL DEFAULT '0',
                "printHtmlId" integer NOT NULL DEFAULT '0',
                "name" character varying(255) NOT NULL DEFAULT '',
                "description" text NOT NULL DEFAULT '',
                "result" character varying(255) NOT NULL DEFAULT '',
                "customStyles" text NOT NULL DEFAULT '',
                "customVariables" text NOT NULL DEFAULT '',
                CONSTRAINT "PK_8632ba127c124301e20c207b2ad" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "roomId" integer NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            ALTER TABLE "LaboratoryGroup"
                ADD "roomId" integer NOT NULL DEFAULT '0'
        `)
        await queryRunner.query(`
            ALTER TABLE "RadiologyGroup"
                ADD "roomId" integer NOT NULL DEFAULT '0'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketLaboratoryGroup"
                ADD "roomId" integer NOT NULL DEFAULT '0'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketLaboratory"
                ADD "roomId" integer NOT NULL DEFAULT '0'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketLaboratoryResult"
                ADD "laboratoryGroupId" integer NOT NULL DEFAULT '0'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketRadiology"
                ADD "roomId" integer NOT NULL DEFAULT '0'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

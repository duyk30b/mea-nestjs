import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version5111731930786124 implements MigrationInterface {
    name = 'Version5111731930786124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Laboratory" 
                DROP COLUMN "maxValue",
                DROP COLUMN "minValue";
            ALTER TABLE "Laboratory"
                ADD "parentId" integer NOT NULL DEFAULT '0',
                ADD "valueType" smallint NOT NULL DEFAULT '1',
                ADD "lowValue" numeric(7, 3),
                ADD "highValue" numeric(7, 3),
                ADD "options" character varying(255) NOT NULL;
            CREATE INDEX "IDX_Laboratory__oid_parentId" 
                ON "Laboratory" ("oid", "parentId");
        `)

        await queryRunner.query(`
            ALTER TABLE "LaboratoryGroup"
                ADD "printHtmlId" integer NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            CREATE TABLE "TicketLaboratory" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "laboratoryId" integer NOT NULL,
                "status" smallint NOT NULL DEFAULT '2',
                "expectedPrice" bigint NOT NULL DEFAULT '0',
                "discountMoney" bigint NOT NULL DEFAULT '0',
                "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                "actualPrice" bigint NOT NULL DEFAULT '0',
                "startedAt" bigint,
                "result" text NOT NULL DEFAULT '{}',
                "attention" text NOT NULL DEFAULT '{}',
                CONSTRAINT "PK_6cd37e3b2a79c05d8144841c254" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketLaboratory__oid_laboratoryId" 
                ON "TicketLaboratory" ("oid", "laboratoryId");
            CREATE INDEX "IDX_TicketLaboratory__oid_ticketId" 
                ON "TicketLaboratory" ("oid", "ticketId");
        `)

        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "laboratoryMoney" bigint NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            SELECT pg_get_serial_sequence('"LaboratoryGroup"', 'id');
            ALTER SEQUENCE "LaboratoryGroup_id_seq" RESTART WITH 1000;
            SELECT pg_get_serial_sequence('"RadiologyGroup"', 'id');
            ALTER SEQUENCE "RadiologyGroup_id_seq" RESTART WITH 1000;
            SELECT pg_get_serial_sequence('"ProcedureGroup"', 'id');
            ALTER SEQUENCE "ProcedureGroup_id_seq" RESTART WITH 1000;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

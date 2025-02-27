import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version721745550709084 implements MigrationInterface {
    name = 'Version721745550709084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "TicketLaboratoryGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "laboratoryGroupId" integer NOT NULL,
                "status" smallint NOT NULL DEFAULT '2',
                "registeredAt" bigint,
                "startedAt" bigint,
                "result" text NOT NULL DEFAULT '',
                CONSTRAINT "PK_ed07106af0feca39a919fe23d2e" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketLaboratoryGroup__oid_startedAt" ON "TicketLaboratoryGroup" ("oid", "startedAt");
            CREATE INDEX "IDX_TicketLaboratoryGroup__oid_ticketId" ON "TicketLaboratoryGroup" ("oid", "ticketId");
        `)

        await queryRunner.query(`
            CREATE TABLE "TicketLaboratoryResult" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "laboratoryId" integer NOT NULL,
                "ticketLaboratoryId" integer NOT NULL,
                "ticketLaboratoryGroupId" integer NOT NULL,
                "result" character varying(255) NOT NULL,
                "attention" smallint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_ddaeda0d70312db5d96522d9b97" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketLaboratoryResult__oid_laboratoryId" 
                ON "TicketLaboratoryResult" ("oid", "laboratoryId");
            CREATE INDEX "IDX_TicketLaboratoryResult__oid_ticketId" 
                ON "TicketLaboratoryResult" ("oid", "ticketId")
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketLaboratory"
                ADD "laboratoryGroupId" integer NOT NULL DEFAULT '0',
                ADD "ticketLaboratoryGroupId" integer NOT NULL DEFAULT '0';
            ALTER TABLE "TicketLaboratory" 
                DROP COLUMN "attention",
                DROP COLUMN "result";
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version5121732599038031 implements MigrationInterface {
    name = 'Version5121732599038031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "TicketAttribute" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "key" character varying(100) NOT NULL,
                "value" text NOT NULL DEFAULT '',
                CONSTRAINT "PK_06635e9c99539cf405d613c35ae" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketAttribute__oid_ticketId" 
                ON "TicketAttribute" ("oid", "ticketId")
        `)
        await queryRunner.query(`
        `)
        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "dailyIndex" smallint NOT NULL DEFAULT '0',
                ADD "imageIds" character varying(100) NOT NULL DEFAULT '[]';

            UPDATE  "Ticket"
            SET     "imageIds" = "TicketDiagnosis"."imageIds"
            FROM    "TicketDiagnosis"
            WHERE   "TicketDiagnosis"."ticketId" = "Ticket"."id";

            INSERT INTO "TicketAttribute" (oid, "ticketId", "key", "value")
            SELECT  "Ticket".oid, 
                    "Ticket"."id", 
                    CASE 
                        WHEN "Ticket"."ticketType" = 2 THEN 'note'
                        ELSE 'reason'
                    END AS "key",
                    "Ticket"."note"
            FROM "Ticket" WHERE "note" IS NOT NULL AND "note" <> '';

            UPDATE "Ticket"
            SET 
                "year" = EXTRACT(YEAR FROM TO_TIMESTAMP(
                    CEILING(("registeredAt" + 7 * 60 * 60 * 1000) / 1000.0))
                ),
                "month" = EXTRACT(MONTH FROM TO_TIMESTAMP(
                    CEILING(("registeredAt" + 7 * 60 * 60 * 1000) / 1000.0))
                ),
                "date" = EXTRACT(DAY FROM TO_TIMESTAMP(
                    CEILING(("registeredAt" + 7 * 60 * 60 * 1000) / 1000.0))
                )
            WHERE "registeredAt" IS NOT NULL AND "registeredAt" != 0 
                AND ("year" = 0 OR "year" IS NULL);

            ALTER TABLE "Ticket"
                DROP COLUMN "note";
        `)

        await queryRunner.query(`
            ALTER TABLE "Customer"
                ADD "customerSourceId" integer NOT NULL DEFAULT '0';

            ALTER TABLE "Customer" 
                DROP COLUMN "identityCard";
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

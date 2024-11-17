import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version591731414084794 implements MigrationInterface {
    name = 'Version591731414084794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Ticket"
                RENAME COLUMN "paraclinicalMoney" TO "radiologyMoney"
        `)
        await queryRunner.query(`
            CREATE TABLE "RadiologyGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                CONSTRAINT "PK_2c4e0c857af4876a78ce99909a4" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            CREATE TABLE "Radiology" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "radiologyGroupId" integer NOT NULL DEFAULT '0',
                "printHtmlId" integer NOT NULL DEFAULT '0',
                "price" integer,
                "descriptionDefault" text NOT NULL,
                "resultDefault" character varying(255) NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                "deletedAt" bigint,
                CONSTRAINT "PK_73221f9dce01012a68295e2ffce" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            CREATE TABLE "TicketRadiology" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "radiologyId" integer NOT NULL,
                "status" smallint NOT NULL DEFAULT '2',
                "expectedPrice" bigint NOT NULL DEFAULT '0',
                "discountMoney" bigint NOT NULL DEFAULT '0',
                "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                "actualPrice" bigint NOT NULL DEFAULT '0',
                "startedAt" bigint,
                "description" text NOT NULL DEFAULT '',
                "result" text NOT NULL DEFAULT '',
                "imageIds" character varying(100) NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_43b4dfbda258fb0db966494989b" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketRadiology__oid_radiologyId" 
                ON "TicketRadiology" ("oid", "radiologyId");
            CREATE INDEX "IDX_TicketRadiology__oid_ticketId" 
                ON "TicketRadiology" ("oid", "ticketId");
        `)

        await queryRunner.query(`
            ALTER TABLE "PrintHtml" DROP COLUMN "paraclinicalId";
            ALTER TABLE "PrintHtml" 
                ADD "initVariable" text NOT NULL DEFAULT '',
                ADD "dataExample" text NOT NULL DEFAULT '';
            ALTER TABLE "PrintHtml"
                RENAME COLUMN "type" TO "name"
        `)

        await queryRunner.query(`
            DROP TABLE "Paraclinical" CASCADE;
            DROP TABLE "ParaclinicalGroup" CASCADE;
            DROP TABLE "ParaclinicalAttribute" CASCADE;
            DROP TABLE "TicketParaclinical" CASCADE;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version581731206803073 implements MigrationInterface {
    name = 'Version581731206803073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Ticket" 
                DROP COLUMN "deliveryStatus",
                DROP COLUMN "procedureStatus",
                DROP COLUMN "radiologyStatus";

            ALTER TABLE "Ticket"
                RENAME COLUMN "radiologyMoney" TO "paraclinicalMoney";
        `)

        await queryRunner.query(`
            ALTER TABLE "PrintHtml" RENAME COLUMN "radiologyId" TO "paraclinicalId";
            ALTER TABLE "PrintHtml" RENAME COLUMN "key" TO "type"
        `)

        await queryRunner.query(`
            CREATE TABLE "Paraclinical" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "conclusionDefault" character varying(255) NOT NULL,
                "paraclinicalGroupId" integer NOT NULL DEFAULT '0',
                "price" integer,
                "attributeLayout" character varying(255) NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                "deletedAt" bigint,
                CONSTRAINT "PK_899b12650a8fc3a4e874d83d7aa" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "ParaclinicalAttribute" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "paraclinicalId" integer NOT NULL,
                "code" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "inputType" character varying(25) NOT NULL DEFAULT 'InputText',
                "default" character varying,
                "options" text NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_3a70c7a59354c4892abb0df94e3" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "ParaclinicalGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "paraclinicalGroupId" integer NOT NULL DEFAULT '0',
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                CONSTRAINT "PK_a6e14a9e216f888f03ff2e17914" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "TicketParaclinical" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "paraclinicalId" integer NOT NULL,
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
                CONSTRAINT "PK_bd83e18a5f16e345b61b2c2e7af" PRIMARY KEY ("id")
            );

            CREATE INDEX "IDX_TicketParaclinical__oid_paraclinicalId" 
                ON "TicketParaclinical" ("oid", "paraclinicalId");

            CREATE INDEX "IDX_TicketParaclinical__oid_ticketId" 
                ON "TicketParaclinical" ("oid", "ticketId");
        `)

        await queryRunner.query(`
            DROP TABLE "Radiology" CASCADE;
            DROP TABLE "RadiologyGroup" CASCADE;
            DROP TABLE "TicketRadiology" CASCADE;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}

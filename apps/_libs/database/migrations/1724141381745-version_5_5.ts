import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version551724141381745 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "TicketUser" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "userId" integer NOT NULL,
                "referenceId" integer NOT NULL,
                "referenceType" integer NOT NULL DEFAULT '0',
                "ticketUserType" integer NOT NULL DEFAULT '0',
                "bolusMoney" integer NOT NULL DEFAULT '0',
                "bolusPercent" integer NOT NULL DEFAULT '0',
                "bolusType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                "createdAt" bigint NOT NULL,
                CONSTRAINT "PK_d9e55a6f079bf193c22de4bdb7e" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketUser__oid_createdAt" ON "TicketUser" ("oid", "createdAt");
            CREATE INDEX "IDX_TicketUser__oid_ticketId" ON "TicketUser" ("oid", "ticketId");
        `)

        await queryRunner.query(`
            CREATE TABLE "UserGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                CONSTRAINT "PK_bef2f06f1ee7a9f8fd7a4f13d9a" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            ALTER TABLE "Procedure"
                ADD "procedureType" smallint NOT NULL DEFAULT '1',
                ADD "quantityDefault" smallint NOT NULL DEFAULT '1',
                ADD "gapHours" smallint NOT NULL DEFAULT '0',
                ADD "discountMoney" integer NOT NULL DEFAULT '0',
                ADD "discountPercent" integer NOT NULL DEFAULT '0',
                ADD "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                ADD "discountStart" bigint,
                ADD "discountEnd" bigint,
                ADD "saleBolusMoney" integer NOT NULL DEFAULT '0',
                ADD "saleBolusPercent" integer NOT NULL DEFAULT '0',
                ADD "saleBolusType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                ADD "primaryBolusMoney" integer NOT NULL DEFAULT '0',
                ADD "primaryBolusPercent" integer NOT NULL DEFAULT '0',
                ADD "primaryBolusType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                ADD "secondaryBolusMoney" integer NOT NULL DEFAULT '0',
                ADD "secondaryBolusPercent" integer NOT NULL DEFAULT '0',
                ADD "secondaryBolusType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                ADD "consumablesHint" text NOT NULL DEFAULT '[]'
        `)

        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "nextTime" bigint,
                ADD "procedureStatus" smallint NOT NULL DEFAULT '1',
                ADD "radiologyStatus" smallint NOT NULL DEFAULT '1';
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketProcedure"
                ADD "status" smallint NOT NULL DEFAULT '1',
                ADD "result" text NOT NULL DEFAULT '',
                ADD "imageIds" character varying(100) NOT NULL DEFAULT '[]';

            ALTER TABLE "TicketProcedure"
                RENAME COLUMN "createdAt" TO "startedAt";

            ALTER TABLE "TicketProcedure"
                ALTER COLUMN "status" SET DEFAULT '2';

            UPDATE  "TicketProcedure" "tp"
            SET     "status" = 3;
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketRadiology"
                ADD "status" smallint NOT NULL DEFAULT '2';

            UPDATE  "TicketRadiology" "tr"
            SET     "status" = 3;
        `)

        await queryRunner.query(`
            ALTER TABLE "Appointment"
                ALTER COLUMN "appointmentType" SET DEFAULT '3'
        `)
        await queryRunner.query(`
            ALTER TABLE "Image"
                ADD "customerId" integer NOT NULL DEFAULT '0'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}

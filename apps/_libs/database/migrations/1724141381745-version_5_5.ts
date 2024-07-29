import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version551724141381745 implements MigrationInterface {
    name = 'Version551724141381745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_Product__oid_group";
            ALTER TABLE "Product" DROP COLUMN "group";
            ALTER TABLE "Product"
                ADD "productGroupId" integer NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            ALTER TABLE "Procedure" DROP COLUMN "group"
        `)

        await queryRunner.query(`
            ALTER TABLE "Radiology" DROP COLUMN "group";
            ALTER TABLE "Radiology"
                ADD "radiologyGroupId" integer NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            ALTER TABLE "Organization"
                ADD "logoImageId" integer NOT NULL DEFAULT '0',
                ADD "note" text NOT NULL DEFAULT '',
                ADD "expiryDate" bigint;
        `)

        await queryRunner.query(`
            ALTER TABLE "Appointment"
                ADD "customerSourceId" integer NOT NULL DEFAULT '0';
            
            ALTER TABLE "Appointment"
                ALTER COLUMN "appointmentType" SET DEFAULT '3';

            ALTER TABLE "Appointment"
                RENAME COLUMN "appointmentType" TO "voucherType";
        `)

        await queryRunner.query(`
            ALTER TABLE "User"
                ADD "isAdmin" smallint NOT NULL DEFAULT '1';

            UPDATE  "User" "u"
                SET     "isAdmin" = CASE 
                            WHEN("roleId" = 1) THEN 1
                            ELSE 0
                        END;
                        
            ALTER TABLE "User" DROP COLUMN "roleId";
        `)

        await queryRunner.query(`
            CREATE TABLE "UserRole" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "roleId" integer NOT NULL,
                CONSTRAINT "PK_83fd6b024a41173978f5b2b9b79" PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "Procedure"
                ADD "procedureGroupId" integer NOT NULL DEFAULT '0',
                ADD "procedureType" smallint NOT NULL DEFAULT '1',
                ADD "quantityDefault" smallint NOT NULL DEFAULT '1',
                ADD "gapHours" smallint NOT NULL DEFAULT '0',
                ADD "consumablesHint" text NOT NULL DEFAULT '[]';
        `)

        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "customerSourceId" integer NOT NULL DEFAULT '0',
                ADD "procedureStatus" smallint NOT NULL DEFAULT '1',
                ADD "radiologyStatus" smallint NOT NULL DEFAULT '1';

            ALTER TABLE "Ticket" DROP COLUMN "userId";
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketDiagnosis" RENAME COLUMN "vitalSigns" TO "general";
            ALTER TABLE "TicketDiagnosis" 
                ADD "regional" text NOT NULL DEFAULT '{}',
                ADD "special" text NOT NULL DEFAULT '{}';
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

            ALTER TABLE "TicketRadiology" DROP COLUMN "doctorId";

            UPDATE  "TicketRadiology" "tr"
            SET     "status" = 3;
        `)

        await queryRunner.query(`
            ALTER TABLE "Image"
                ADD "customerId" integer NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            CREATE TABLE "Warehouse" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                "deletedAt" bigint,
                CONSTRAINT "PK_c4485aa90c562f2737068d271ef" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "RadiologyGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "radiologyGroupId" integer NOT NULL DEFAULT '0',
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
            CREATE TABLE "ProductGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                CONSTRAINT "PK_d998affd86f02f31aeca7ce4d1a" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            CREATE TABLE "ProcedureGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                CONSTRAINT "PK_079ed8fd774bca51b0688a195dd" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "TicketUser" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "userId" integer NOT NULL,
                "referenceId" integer NOT NULL,
                "referenceType" integer NOT NULL DEFAULT '0',
                "roleId" integer NOT NULL DEFAULT '0',
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
            CREATE TABLE "CustomerSource" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                CONSTRAINT "PK_b3e53283b76b34baba28f8d410b" PRIMARY KEY ("id")
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}

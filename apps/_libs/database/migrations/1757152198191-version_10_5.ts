import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1051757152198191 implements MigrationInterface {
    name = 'Version1051757152198191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()
        try {
            await queryRunner.query(`
                DROP TABLE "TicketProcedureItem" CASCADE;
            `)
            await queryRunner.query(`
                ALTER TABLE "Image" DROP COLUMN "ticketItemChildId"
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketUser" DROP COLUMN "ticketItemChildId"
            `)

            await queryRunner.query(`
                CREATE TABLE "Regimen" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "code" character varying(50) NOT NULL,
                    "name" character varying(255) NOT NULL,
                    "gapHours" integer NOT NULL DEFAULT '24',
                    "gapHoursType" smallint NOT NULL DEFAULT '24',
                    "isActive" smallint NOT NULL DEFAULT '1',
                    CONSTRAINT "UNIQUE_Regimen__oid_code" UNIQUE ("oid", "code"),
                    CONSTRAINT "PK_10e1a5bdde0a60fbb992c00d38e" PRIMARY KEY ("id")
                )
            `)

            await queryRunner.query(`
                CREATE TABLE "RegimenItem" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "regimenId" integer NOT NULL DEFAULT '0',
                    "procedureId" integer NOT NULL DEFAULT '0',
                    "quantity" smallint NOT NULL DEFAULT '1',
                    CONSTRAINT "PK_1eceeb9cd3b811a9e2f7d13871c" PRIMARY KEY ("id")
                );
                CREATE INDEX "IDX_RegimenItem__oid_regimenId" ON "RegimenItem" ("oid", "regimenId");
            `)

            await queryRunner.query(`
                CREATE TABLE "TicketRegimen" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "ticketId" integer NOT NULL,
                    "customerId" integer NOT NULL,
                    "regimenId" integer NOT NULL,
                    "expectedPrice" integer NOT NULL DEFAULT '0',
                    "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                    "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                    "discountMoney" integer NOT NULL DEFAULT '0',
                    "actualPrice" integer NOT NULL DEFAULT '0',
                    "commissionAmount" integer NOT NULL DEFAULT '0',
                    "costAmount" integer NOT NULL DEFAULT '0',
                    "paymentMoneyStatus" smallint NOT NULL DEFAULT '1',
                    "status" smallint NOT NULL DEFAULT '2',
                    "createdAt" bigint NOT NULL,
                    "completedAt" bigint,
                    CONSTRAINT "PK_d90ee5d9c6ca4aab6c4e57d9b70" PRIMARY KEY ("id")
                );
                CREATE INDEX "IDX_TicketRegimen__oid_ticketId" ON "TicketRegimen" ("oid", "ticketId");
                CREATE INDEX "IDX_TicketRegimen__oid_customerId" ON "TicketRegimen" ("oid", "customerId");
                CREATE INDEX "IDX_TicketRegimen__oid_regimenId" ON "TicketRegimen" ("oid", "regimenId");
            `)

            await queryRunner.query(`
                ALTER TABLE "Procedure" 
                    DROP COLUMN "gapHoursType",
                    DROP COLUMN "totalSessions",
                    DROP COLUMN "gapHours"
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProcedure" 
                    DROP COLUMN "procedureType",
                    DROP COLUMN "finishedSessions",
                    DROP COLUMN "totalSessions";
                ALTER TABLE "TicketProcedure"
                    ADD "ticketProcedureType" smallint NOT NULL DEFAULT '1',
                    ADD "ticketRegimenId" integer NOT NULL DEFAULT '0',
                    ADD "sessionIndex" integer NOT NULL DEFAULT '0',
                    ADD "result" text NOT NULL DEFAULT '',
                    ADD "imageIds" character varying(100) NOT NULL DEFAULT '[]',
                    ADD "completedAt" bigint,
                    ADD "costAmount" integer NOT NULL DEFAULT '0',
                    ADD "commissionAmount" integer NOT NULL DEFAULT '0';
                ALTER TABLE "TicketProcedure"
                    ALTER COLUMN "status" SET DEFAULT '1';
                CREATE INDEX "IDX_TicketProcedure__oid_customerId" ON "TicketProcedure" ("oid", "customerId");
            `)

            await queryRunner.query(`
                ALTER TABLE "Appointment" 
                    DROP COLUMN "ticketProcedureItemId",
                    DROP COLUMN "type",
                    DROP COLUMN "ticketProcedureId";
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

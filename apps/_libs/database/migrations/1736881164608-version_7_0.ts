import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version701736881164608 implements MigrationInterface {
    name = 'Version701736881164608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Organization"
                RENAME COLUMN "isActive" TO "status"
        `)

        await queryRunner.query(`
            ALTER TABLE "Role"
                ADD "displayName" character varying(255) NOT NULL DEFAULT ''
        `)

        await queryRunner.query(`
            ALTER TABLE "Procedure" 
                DROP COLUMN "deletedAt"
        `)

        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "commissionMoney" bigint NOT NULL DEFAULT '0';

            ALTER TABLE "Ticket"
                RENAME COLUMN "totalCostAmount" TO "itemsCostAmount";
        `)

        await queryRunner.query(`
            CREATE TABLE "Commission" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "roleId" integer NOT NULL,
                "interactId" integer NOT NULL DEFAULT '0',
                "interactType" smallint NOT NULL DEFAULT '1',
                "commissionValue" numeric(10, 3) NOT NULL DEFAULT '0',
                "commissionCalculatorType" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_d7dcc93818e7e1e816adf58bee3" PRIMARY KEY ("id")
            );
            CREATE UNIQUE INDEX "IDX_Commission__oid_roleId_interactType_interactId" 
                ON "Commission" ("oid", "roleId", "interactType", "interactId")
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketLaboratory"
                ADD "priority" integer NOT NULL DEFAULT '1'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketProcedure"
                ADD "priority" integer NOT NULL DEFAULT '1'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketProduct"
                ADD "priority" integer NOT NULL DEFAULT '1'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketRadiology"
                ADD "priority" integer NOT NULL DEFAULT '1'
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketUser" 
                DROP COLUMN "bolusType",
                DROP COLUMN "referenceId",
                DROP COLUMN "bolusMoney",
                DROP COLUMN "referenceType",
                DROP COLUMN "bolusPercent";

            ALTER TABLE "TicketUser"
                ADD "interactType" smallint NOT NULL DEFAULT '1',
                ADD "interactId" integer NOT NULL DEFAULT '0',
                ADD "ticketItemId" integer NOT NULL DEFAULT '0',
                ADD "ticketItemExpectedPrice" bigint NOT NULL DEFAULT '0',
                ADD "ticketItemActualPrice" bigint NOT NULL DEFAULT '0',
                ADD "quantity" integer NOT NULL DEFAULT '1',
                ADD "commissionMoney" bigint NOT NULL DEFAULT '0',
                ADD "commissionPercentExpected" numeric(5, 3) NOT NULL DEFAULT '0',
                ADD "commissionPercentActual" numeric(5, 3) NOT NULL DEFAULT '0',
                ADD "commissionCalculatorType" smallint NOT NULL DEFAULT '1';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

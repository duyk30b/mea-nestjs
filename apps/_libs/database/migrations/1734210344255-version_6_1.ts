import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version611734210344255 implements MigrationInterface {
    name = 'Version611734210344255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Organization"
                RENAME COLUMN "isActive" TO "status"
        `)

        await queryRunner.query(`
            CREATE TABLE "Commission" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "roleId" integer NOT NULL,
                "interactId" integer NOT NULL DEFAULT '0',
                "interactType" smallint NOT NULL DEFAULT '1',
                "value" numeric(10, 3) NOT NULL DEFAULT '0',
                "calculatorType" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_d7dcc93818e7e1e816adf58bee3" PRIMARY KEY ("id")
            );
            CREATE UNIQUE INDEX "IDX_Setting__oid_roleId_interactType_interactId" 
                ON "Commission" ("oid", "roleId", "interactType", "interactId")
        `)

        await queryRunner.query(`
            ALTER TABLE "Role"
                ADD "displayName" character varying(255) NOT NULL DEFAULT ''
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
                ADD "commissionMoney" integer NOT NULL DEFAULT '0',
                ADD "commissionValue" numeric(10, 3) NOT NULL DEFAULT '0',
                ADD "commissionCalculatorType" smallint NOT NULL DEFAULT '1';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

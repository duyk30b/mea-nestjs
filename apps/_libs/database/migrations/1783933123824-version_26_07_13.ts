import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version2607131783933123824 implements MigrationInterface {
    name = 'Version2607131783933123824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()
        try {
            await queryRunner.query(`
                CREATE TABLE "CustomerGroup" (
                    "oid" integer NOT NULL,
                    "id" bigint NOT NULL,
                    "name" character varying(255) NOT NULL,
                    CONSTRAINT "PK_29a8b2488e776ed0f794ccec511" PRIMARY KEY ("id")
                )
            `)
            await queryRunner.query(`
                ALTER TABLE "Customer"
                    ADD "customerGroupId" bigint NOT NULL DEFAULT '0',
                    ADD "isHasTicket" smallint NOT NULL DEFAULT '1';
            `)
            await queryRunner.query(`
                ALTER TABLE "TicketProduct"
                    ALTER COLUMN "pickupStrategy" SET DEFAULT '3'
            `)

            await queryRunner.query(`
                ALTER TABLE "Appointment" DROP COLUMN "customerSourceId"
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketReception" DROP COLUMN "customerSourceId";
                ALTER TABLE "TicketReception"
                    RENAME COLUMN "isFirstReception" TO "isMainReception"
            `)

            await queryRunner.query(`
                ALTER TABLE "Ticket" DROP COLUMN "customerSourceId";
                ALTER TABLE "Ticket"
                    ADD "isFirstVisit" smallint NOT NULL DEFAULT '0'
            `)

            await queryRunner.commitTransaction()
        } catch (error: any) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

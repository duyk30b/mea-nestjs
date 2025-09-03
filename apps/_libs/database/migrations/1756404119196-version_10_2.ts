import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1021756404119196 implements MigrationInterface {
    name = 'Version1021756404119196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "Appointment"
                    RENAME COLUMN "appointmentStatus" TO "status";
                ALTER TABLE "Appointment"
                    ADD "type" smallint NOT NULL DEFAULT '1',
                    ADD "ticketProcedureId" integer NOT NULL DEFAULT '0',
                    ADD "ticketProcedureItemId" integer NOT NULL DEFAULT '0';
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProcedure"
                    ADD "type" smallint NOT NULL DEFAULT '1';
                ALTER TABLE "TicketProcedure"
                    RENAME COLUMN "completedSessions" TO "finishedSessions";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProcedureItem"
                    ADD "indexSession" smallint NOT NULL DEFAULT '0',
                    ADD "registeredAt" bigint;
            `)

            await queryRunner.query(`
                DROP INDEX "public"."IDX_Position__oid_roleId_positionType_positionInteractId";
                ALTER TABLE "Position"
                    ADD "priority" integer NOT NULL DEFAULT '0';
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketUser"
                    ADD "ticketItemChildId" integer NOT NULL DEFAULT '0',
                    ADD "positionId" integer NOT NULL DEFAULT '0';
                ALTER TABLE "TicketUser"
                    ALTER COLUMN "commissionPercentActual" TYPE numeric(7, 3);
                ALTER TABLE "TicketUser"
                    ALTER COLUMN "commissionPercentExpected" TYPE numeric(7, 3);
            `)

            await queryRunner.query(`
                ALTER TABLE "Image"
                    ADD "ticketId" integer NOT NULL DEFAULT '0';
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

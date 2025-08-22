import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version9811754257975055 implements MigrationInterface {
    name = 'Version9811754257975055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "TicketProduct" ADD "createdAt" bigint;

            UPDATE  "TicketProduct"
            SET     "createdAt" = "Ticket"."registeredAt"
            FROM    "Ticket"
            WHERE   "TicketProduct"."ticketId" = "Ticket"."id";

            ALTER TABLE "Room" ADD "roomStyle" smallint NOT NULL DEFAULT '0';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

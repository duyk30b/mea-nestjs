import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version811746538806064 implements MigrationInterface {
    name = 'Version811746538806064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "note" character varying(255) NOT NULL DEFAULT '';
        `)

        await queryRunner.query(`
            UPDATE "Ticket" t
            SET "note" = ta."value"
            FROM "TicketAttribute" ta
            WHERE ta."ticketId" = t."id"
            AND ta."key" = 'note';

            DELETE FROM "TicketAttribute"
            WHERE "key" = 'note';

            UPDATE "PrintHtml"
            SET content = REPLACE(content, 'DTimer', 'ESTimer')
            WHERE content LIKE '%DTimer%';

            UPDATE "PrintHtml"
            SET content = REPLACE(content, 'ticket.ticketAttributeMap?.diagnosis', 'ticket.note')
            WHERE content LIKE '%ticket.ticketAttributeMap?.diagnosis%';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

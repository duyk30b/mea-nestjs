import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version511722350522047 implements MigrationInterface {
    name = 'Version511722350522047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Ticket"
            ADD "userId" integer NOT NULL DEFAULT '0'
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketProduct"
            ADD "type" smallint NOT NULL DEFAULT '1'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Ticket" DROP COLUMN "userId"
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketProduct" DROP COLUMN "type"
        `)
    }
}

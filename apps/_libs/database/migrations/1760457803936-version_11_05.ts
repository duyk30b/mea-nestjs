import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version11051760457803936 implements MigrationInterface {
    name = 'Version11051760457803936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "PaymentTicketItem"
                    ADD "sessionIndex" smallint NOT NULL DEFAULT '0'
            `)
            await queryRunner.query(`
                DELETE FROM "Payment" p
                WHERE "voucherType" = 2
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Ticket" t
                    WHERE t."id" = p."voucherId"
                );
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

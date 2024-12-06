import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version5141733107457213 implements MigrationInterface {
    name = 'Version5141733107457213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "Ticket"
            SET 
                "year" = EXTRACT(YEAR FROM TO_TIMESTAMP(
                    CEILING(("registeredAt" + 7 * 60 * 60 * 1000) / 1000.0))
                ),
                "month" = EXTRACT(MONTH FROM TO_TIMESTAMP(
                    CEILING(("registeredAt" + 7 * 60 * 60 * 1000) / 1000.0))
                ),
                "date" = EXTRACT(DAY FROM TO_TIMESTAMP(
                    CEILING(("registeredAt" + 7 * 60 * 60 * 1000) / 1000.0))
                )
        `)
        await queryRunner.query(`
            DROP TABLE "TicketDiagnosis" CASCADE;
        `)
        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "itemsActualMoney" bigint NOT NULL DEFAULT '0',
                ADD "itemsDiscount" bigint NOT NULL DEFAULT '0';

            ALTER TABLE "Ticket" RENAME COLUMN "proceduresMoney" TO "procedureMoney";
            ALTER TABLE "Ticket" RENAME COLUMN "productsMoney" TO "productMoney";
        `)

        await queryRunner.query(`
            ALTER TABLE "Organization" 
                DROP COLUMN "dataVersion";
            ALTER TABLE "Organization"
                ADD "dataVersion" character varying NOT NULL DEFAULT '{}';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}

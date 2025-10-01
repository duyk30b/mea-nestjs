import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version11011759083828671 implements MigrationInterface {
    name = 'Version11011759083828671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "TicketRegimen" DROP COLUMN "paymentMoneyStatus";
                ALTER TABLE "TicketRegimen"
                    ADD "isPaymentEachSession" smallint NOT NULL DEFAULT '0';
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketRegimenItem"
                    RENAME COLUMN "quantityTotal" TO "quantityExpected";
                ALTER TABLE "TicketRegimenItem"
                    ADD "isPaymentEachSession" smallint NOT NULL DEFAULT '0',
                    ADD "paymentMoneyStatus" smallint NOT NULL DEFAULT '1',
                    ADD "quantityPayment" smallint NOT NULL DEFAULT '0';

                ALTER TABLE "TicketRegimenItem" 
                    ALTER COLUMN "quantityExpected" TYPE smallint;
                ALTER TABLE "TicketRegimenItem" 
                    ALTER COLUMN "quantityFinish" TYPE smallint;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProduct" DROP COLUMN "paymentEffect"
            `)

            await queryRunner.query(`
                ALTER TABLE "Laboratory" DROP CONSTRAINT "UNIQUE_Laboratory__oid_laboratoryCode"
            `)

            await queryRunner.query(`
                UPDATE "Ticket"
                    SET "receptionAt" = "createdAt"
                    WHERE "receptionAt" IS NULL;
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version11021759196054385 implements MigrationInterface {
    name = 'Version11021759196054385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "TicketRegimenItem"
                    ADD "expectedMoneyAmount" integer NOT NULL DEFAULT '0',
                    ADD "actualMoneyAmount" integer NOT NULL DEFAULT '0',
                    ADD "discountMoneyAmount" integer NOT NULL DEFAULT '0',
                    ADD "paymentMoneyAmount" integer NOT NULL DEFAULT '0';

                UPDATE  "TicketRegimenItem"
                SET     "quantityPayment" = "quantityExpected",
                        "expectedMoneyAmount" = "quantityExpected" *  "expectedPrice",
                        "actualMoneyAmount" = "quantityExpected" * "actualPrice",
                        "discountMoneyAmount" = "quantityExpected" * "discountMoney",
                        "paymentMoneyAmount" = "quantityPayment" * "actualPrice";
                    
                ALTER TABLE "TicketRegimenItem" 
                    DROP COLUMN "paymentMoneyStatus",
                    DROP COLUMN "isPaymentEachSession",
                    DROP COLUMN "expectedPrice",
                    DROP COLUMN "actualPrice",
                    DROP COLUMN "discountMoney";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketRegimen" 
                    DROP COLUMN "isPaymentEachSession";
                ALTER TABLE "TicketRegimen" 
                    RENAME COLUMN "expectedPrice" TO "expectedMoney";
                ALTER TABLE "TicketRegimen" 
                    RENAME COLUMN "actualPrice" TO "actualMoney";
                ALTER TABLE "TicketRegimen"
                    ADD "remainingMoney" integer NOT NULL DEFAULT '0',
                    ADD "spentMoney" integer NOT NULL DEFAULT '0';

                UPDATE  "TicketRegimen" "tr"
                SET     "spentMoney" = "temp"."sumPaymentMoneyAmount"
                FROM    ( 
                SELECT "ticketRegimenId", SUM("paymentMoneyAmount") as "sumPaymentMoneyAmount" 
                    FROM "TicketRegimenItem"
                    GROUP BY "ticketRegimenId" 
                ) AS "temp" 
                WHERE "tr"."id" = "temp"."ticketRegimenId";
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

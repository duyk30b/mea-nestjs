import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version11031759661142541 implements MigrationInterface {
    name = 'Version11031759661142541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                UPDATE  "TicketProcedure"
                SET     "paymentMoneyStatus" = 1
                WHERE   "ticketProcedureType" = 2 AND "status" IN (2,3);
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketRegimenItem" 
                    RENAME COLUMN "quantityExpected"    TO "quantityRegular";
                ALTER TABLE "TicketRegimenItem" 
                    RENAME COLUMN "expectedMoneyAmount" TO "moneyAmountRegular";
                ALTER TABLE "TicketRegimenItem" 
                    RENAME COLUMN "actualMoneyAmount"   TO "moneyAmountSale";
                ALTER TABLE "TicketRegimenItem"
                    ADD "quantityActual" smallint NOT NULL DEFAULT '0',
                    ADD "quantityUsed" smallint NOT NULL DEFAULT '0',
                    ADD "quantityPaid" smallint NOT NULL DEFAULT '0',
                    ADD "moneyAmountActual" integer NOT NULL DEFAULT '0',
                    ADD "moneyAmountUsed" integer NOT NULL DEFAULT '0',
                    ADD "moneyAmountPaid" integer NOT NULL DEFAULT '0';

                ALTER TABLE "TicketRegimenItem" 
                    DROP COLUMN "paymentMoneyAmount",
                    DROP COLUMN "quantityFinish",
                    DROP COLUMN "quantityPayment";

                UPDATE  "TicketRegimenItem" "tri"
                SET     "quantityUsed"      = "temp"."sumQuantity",
                        "quantityPaid"      = 0,
                        "moneyAmountUsed"   = "temp"."sumMoneyAmount",
                        "moneyAmountPaid"   = 0
                FROM    ( 
                SELECT "ticketRegimenItemId", 
                        SUM("quantity")                 AS "sumQuantity",  
                        SUM("quantity" * "actualPrice") AS "sumMoneyAmount"
                    FROM "TicketProcedure"
                    WHERE "ticketProcedureType" = 2 AND "status" = 3
                    GROUP BY "ticketRegimenItemId" 
                ) AS "temp" 
                WHERE "tri"."id" = "temp"."ticketRegimenItemId";

                UPDATE  "TicketRegimenItem" "tri"
                SET     "quantityActual"    = "temp"."sumQuantity",
                        "moneyAmountActual"   = "temp"."sumMoneyAmount",
                        "moneyAmountPaid"   = "temp"."sumMoneyAmount"
                FROM    ( 
                SELECT "ticketRegimenItemId", 
                        SUM("quantity")                 AS "sumQuantity",  
                        SUM("quantity" * "actualPrice") AS "sumMoneyAmount"
                    FROM "TicketProcedure"
                    WHERE "ticketProcedureType" = 2 AND "status" != -1
                    GROUP BY "ticketRegimenItemId" 
                ) AS "temp" 
                WHERE "tri"."id" = "temp"."ticketRegimenItemId";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketRegimen" 
                    RENAME COLUMN "expectedMoney" TO "moneyAmountRegular";
                ALTER TABLE "TicketRegimen" 
                    RENAME COLUMN "actualMoney" TO "moneyAmountSale";

                ALTER TABLE "TicketRegimen"
                    ADD "moneyAmountActual" integer NOT NULL DEFAULT '0',
                    ADD "moneyAmountUsed" integer NOT NULL DEFAULT '0',
                    ADD "moneyAmountPaid" integer NOT NULL DEFAULT '0',
                    ADD "isEffectTotalMoney" integer NOT NULL DEFAULT '0';

                ALTER TABLE "TicketRegimen" 
                    DROP COLUMN "remainingMoney",
                    DROP COLUMN "spentMoney";

                UPDATE  "TicketRegimen" "tr"
                SET     "moneyAmountActual" = "temp"."sumMoneyAmountActual",
                        "moneyAmountUsed"   = "temp"."sumMoneyAmountUsed",
                        "moneyAmountPaid"   = "temp"."sumMoneyAmountPaid"
                FROM    ( 
                SELECT "ticketRegimenId", 
                        SUM("moneyAmountActual") as "sumMoneyAmountActual", 
                        SUM("moneyAmountUsed") as "sumMoneyAmountUsed", 
                        SUM("moneyAmountPaid") as "sumMoneyAmountPaid"
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

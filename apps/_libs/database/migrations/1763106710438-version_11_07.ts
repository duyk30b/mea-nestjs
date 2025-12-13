import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version11071763106710438 implements MigrationInterface {
    name = 'Version11071763106710438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "PaymentMethod" DROP CONSTRAINT "UNIQUE_PaymentMethod__oid_code";
                ALTER TABLE "PaymentMethod" RENAME TO "Wallet";
                ALTER SEQUENCE "PaymentMethod_id_seq" RENAME TO "Wallet_id_seq";

                ALTER TABLE "Wallet" ALTER COLUMN id TYPE bigint;
                ALTER TABLE "Wallet" ALTER COLUMN id SET NOT NULL;
                ALTER TABLE "Wallet" ALTER COLUMN id DROP DEFAULT;
                DROP SEQUENCE IF EXISTS "Wallet_id_seq";

                ALTER TABLE "Wallet"
                    ADD "walletType" smallint NOT NULL DEFAULT '0',
                    ADD "money" bigint NOT NULL DEFAULT '0';
                ALTER TABLE "Wallet"
                    ADD CONSTRAINT "UNIQUE_Wallet__oid_code" UNIQUE ("oid", "code");
            `)

            await queryRunner.query(`
                DROP INDEX "public"."IDX_Payment__oid_paymentMethodId";
                ALTER TABLE "Payment" RENAME COLUMN "paymentMethodId" TO "walletId";
                ALTER TABLE "Payment" ALTER COLUMN "walletId" TYPE bigint;
                CREATE INDEX "IDX_Payment__oid_walletId" ON "Payment" ("oid", "walletId");

                ALTER TABLE "Payment" RENAME COLUMN "openDebt" TO "personOpenDebt";
                ALTER TABLE "Payment" RENAME COLUMN "closeDebt" TO "personCloseDebt";

                ALTER TABLE "Payment"
                    ADD "walletOpenMoney" bigint NOT NULL DEFAULT '0',
                    ADD "walletCloseMoney" bigint NOT NULL DEFAULT '0',
                    ADD "paid" bigint NOT NULL DEFAULT '0',
                    ADD "debt" bigint NOT NULL DEFAULT '0',
                    ADD "paidItem" bigint NOT NULL DEFAULT '0',
                    ADD "debtItem" bigint NOT NULL DEFAULT '0';

                UPDATE  "Payment" "payment"
                SET     "paid"              = "paidAmount",
                        "debt"              = "debtAmount"
                WHERE   "paymentActionType" != 6 AND "paymentActionType" != 7;

                UPDATE  "Payment" "payment"
                SET     "paidItem"          = "paidAmount",
                        "debtItem"          = "debtAmount"
                WHERE   "paymentActionType" = 6 OR "paymentActionType" = 7;

                ALTER TABLE "Payment" 
                    DROP COLUMN "paidAmount",
                    DROP COLUMN "debtAmount";

                UPDATE  "Payment" "payment"
                SET     "note" = '',
                        "paymentActionType"  = CASE 
                            WHEN("paymentActionType" = 1) THEN 1
                            WHEN("paymentActionType" = 2) THEN 2
                            WHEN("paymentActionType" = 3) THEN 5
                            WHEN("paymentActionType" = 4) THEN 3
                            WHEN("paymentActionType" = 5) THEN 4
                            WHEN("paymentActionType" = 6) THEN 1
                            WHEN("paymentActionType" = 7) THEN 2
                            WHEN("paymentActionType" = 8) THEN 8
                            ELSE 0
                        END;

                DELETE FROM "Payment"
                    WHERE "voucherType" = 1 
                        AND "voucherId" NOT IN ( SELECT "id" FROM "PurchaseOrder" );
                        
                UPDATE  "Payment" "payment"
                    SET     "paid"              = -"paid"
                    WHERE "voucherType" = 1 AND "createdAt" < 1765640798519;

                UPDATE  "Payment" "payment"
                    SET     "moneyDirection" = 2
                    WHERE "voucherType" = 2 
                       AND "paymentActionType" = 2
                       AND "moneyDirection" = 1
                       AND "createdAt" < 1765634400000
                       AND "paid" + "paidItem" < 0;

                UPDATE  "Payment" "payment"
                    SET     "paid" = -"paid",
                            "paidItem" = -"paidItem"
                    WHERE "voucherType" = 2 
                       AND "paymentActionType" = 2
                       AND "moneyDirection" = 2
                       AND "createdAt" < 1765634400000
                       AND "paid" + "paidItem"> 0;
            `)

            await queryRunner.query(`
                ALTER TABLE "PaymentTicketItem"
                    ADD "paidItem" bigint NOT NULL DEFAULT '0',
                    ADD "debtItem" bigint NOT NULL DEFAULT '0';

                UPDATE  "PaymentTicketItem"
                SET     "paidItem"  = "actualPrice" * "quantity";
            `)

            await queryRunner.query(`
                ALTER TABLE "Ticket"
                    ADD "paidItem" bigint NOT NULL DEFAULT '0',
                    ADD "debtItem" bigint NOT NULL DEFAULT '0';

                UPDATE  "Ticket" "ticket"
                SET     "debt"              = 0
                WHERE   "status" != 5;

                UPDATE  "Ticket" "ticket"
                SET     "paidItem"          = "paid",
                        "debtItem"          = "debt",
                        "paid"              = 0,
                        "debt"              = 0
                WHERE   "isPaymentEachItem" = 1;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketRegimen"
                    ADD "paid" integer NOT NULL DEFAULT '0',
                    ADD "debt" integer NOT NULL DEFAULT '0',
                    ADD "paidItem" integer NOT NULL DEFAULT '0',
                    ADD "debtItem" integer NOT NULL DEFAULT '0';

                UPDATE  "TicketRegimen" "tr"
                SET     "paidItem"        = "moneyAmountPaid";

                UPDATE  "Ticket" "ticket"
                SET     "paid"      = "ticket"."paid"     + "str"."sumPaid",
                        "paidItem"  = "ticket"."paidItem" - "str"."sumPaid"
                FROM    ( 
                SELECT "ticketId", SUM("moneyAmountWallet") as "sumPaid" 
                    FROM "TicketRegimen"
                    GROUP BY "ticketId" 
                ) AS "str" 
                WHERE "ticket"."id" = "str"."ticketId";

                ALTER TABLE "TicketRegimen" 
                    DROP COLUMN "moneyAmountPaid",
                    DROP COLUMN "moneyAmountWallet";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProcedure"
                    ADD "paid" integer NOT NULL DEFAULT '0',
                    ADD "debt" integer NOT NULL DEFAULT '0';

                UPDATE  "TicketProcedure"
                SET     "paid"          = "quantity" * "actualPrice"
                WHERE   "paymentMoneyStatus" = 4;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProduct"
                    ADD "paid" integer NOT NULL DEFAULT '0',
                    ADD "debt" integer NOT NULL DEFAULT '0';

                UPDATE  "TicketProduct"
                SET     "paid"          = "quantity" * "actualPrice"
                WHERE   "paymentMoneyStatus" = 4;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketLaboratory"
                    ADD "paid" integer NOT NULL DEFAULT '0',
                    ADD "debt" integer NOT NULL DEFAULT '0';

                UPDATE  "TicketLaboratory"
                SET     "paid"          = "actualPrice"
                WHERE   "paymentMoneyStatus" = 4;

            `)

            await queryRunner.query(`
                ALTER TABLE "TicketRadiology"
                    ADD "paid" integer NOT NULL DEFAULT '0',
                    ADD "debt" integer NOT NULL DEFAULT '0';

                UPDATE  "TicketRadiology"
                SET     "paid"          = "actualPrice"
                WHERE   "paymentMoneyStatus" = 4;
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

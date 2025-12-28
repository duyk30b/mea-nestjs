import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1181766942734656 implements MigrationInterface {
    name = 'Version1181766942734656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.commitTransaction()

            await queryRunner.query(`
                CREATE TABLE "TicketPaymentDetail" (
                    "oid" integer NOT NULL,
                    "id" bigint NOT NULL,
                    "ticketId" bigint NOT NULL,
                    "paidWait" integer NOT NULL DEFAULT '0',
                    "paidItem" integer NOT NULL DEFAULT '0',
                    "paidSurcharge" integer NOT NULL DEFAULT '0',
                    "paidDiscount" integer NOT NULL DEFAULT '0',
                    "debtItem" integer NOT NULL DEFAULT '0',
                    "debtSurcharge" integer NOT NULL DEFAULT '0',
                    "debtDiscount" integer NOT NULL DEFAULT '0',
                    CONSTRAINT "PK_c8bfb3c4dddcab98eab4bcb7279" PRIMARY KEY ("id", "ticketId")
                );

                CREATE INDEX "IDX_TicketPaymentDetail__oid_ticketId" ON "TicketPaymentDetail" ("oid", "ticketId");
            `)

            await queryRunner.query(`
                CREATE TABLE "OrganizationPayment" (
                    "id" SERIAL NOT NULL,
                    "oid" character varying NOT NULL,
                    "payment" integer NOT NULL DEFAULT '0',
                    "createdAt" bigint NOT NULL,
                    "note" character varying(255),
                    CONSTRAINT "PK_0581e6e9d4893fba282337de925" PRIMARY KEY ("id")
                );
                CREATE INDEX "IDX_OrganizationPayment__oid" ON "OrganizationPayment" ("oid");
            `)

            await queryRunner.query(`
                ALTER TABLE "Ticket"
                    ADD "paidTotal" integer NOT NULL DEFAULT '0',
                    ADD "debtTotal" integer NOT NULL DEFAULT '0';

                UPDATE  "Ticket"
                SET     "paidTotal"          =  "paid" + "paidItem",
                        "debtTotal"          =  "debt" + "debtItem";

                INSERT INTO "TicketPaymentDetail" (
                    oid, id, "ticketId", "paidWait", "paidItem", "debtItem"
                )
                SELECT oid, id, id, "paid", "paidItem", "debtItem"
                FROM "Ticket" WHERE "isPaymentEachItem" = 1;

                ALTER TABLE "Ticket" 
                    DROP COLUMN "debt",
                    DROP COLUMN "paid",
                    DROP COLUMN "debtItem",
                    DROP COLUMN "paidItem";
            `)

            await queryRunner.query(`
                ALTER TABLE "Payment"
                    ADD "hasPaymentItem" smallint NOT NULL DEFAULT '0',
                    ADD "paidTotal" integer NOT NULL DEFAULT '0',
                    ADD "debtTotal" integer NOT NULL DEFAULT '0';

                UPDATE  "Payment"
                SET     "paidTotal"          =  "paid" + "paidItem",
                        "debtTotal"          =  "debt" + "debtItem",
                        "hasPaymentItem"  = CASE 
                            WHEN("paidItem" != 0) THEN 1
                            WHEN("debtItem" != 0) THEN 1
                            ELSE 0
                        END;

                ALTER TABLE "Payment" 
                    DROP COLUMN "paidItem",
                    DROP COLUMN "debtItem",
                    DROP COLUMN "debt",
                    DROP COLUMN "paid";
            `)

            await queryRunner.query(`
                ALTER TABLE "PaymentTicketItem"
                    ADD "paidMoney" integer NOT NULL DEFAULT '0',
                    ADD "debtMoney" integer NOT NULL DEFAULT '0';

                UPDATE  "PaymentTicketItem"
                SET     "paidMoney"          = "paidItem",
                        "debtMoney"          = "debtItem",
                        "ticketItemType"  = CASE 
                            WHEN("ticketItemType" = 1) THEN 4
                            WHEN("ticketItemType" = 2) THEN 5
                            WHEN("ticketItemType" = 3) THEN 6
                            WHEN("ticketItemType" = 4) THEN 7
                            WHEN("ticketItemType" = 5) THEN 8
                            WHEN("ticketItemType" = 6) THEN 9
                            ELSE 0
                        END;

                ALTER TABLE "PaymentTicketItem" 
                    DROP COLUMN "debtItem",
                    DROP COLUMN "paidItem";
            `)
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

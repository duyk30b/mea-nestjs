import { MigrationInterface, QueryRunner } from 'typeorm'

const VoucherType = {
    Unknown: 0,
    Receipt: 1,
    Ticket: 2,
}

const PersonType = {
    Unknown: 0,
    Distributor: 1,
    Customer: 2,
    Employee: 3,
}

const MoneyDirection = {
    In: 1,
    Out: 2,
}

export class Version871748661366476 implements MigrationInterface {
    name = 'Version871748661366476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "Payment" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "paymentMethodId" integer NOT NULL DEFAULT '0',
                "voucherType" smallint NOT NULL DEFAULT '0',
                "voucherId" integer NOT NULL DEFAULT '0',
                "personType" smallint NOT NULL DEFAULT '0',
                "personId" integer NOT NULL DEFAULT '0',
                "paymentTiming" smallint NOT NULL DEFAULT '10',
                "createdAt" bigint NOT NULL,
                "moneyDirection" smallint NOT NULL,
                "paidAmount" bigint NOT NULL DEFAULT '0',
                "debtAmount" bigint NOT NULL DEFAULT '0',
                "openDebt" bigint NOT NULL DEFAULT '0',
                "closeDebt" bigint NOT NULL DEFAULT '0',
                "cashierId" integer NOT NULL DEFAULT '0',
                "note" character varying(255),
                "description" character varying(255),
                CONSTRAINT "PK_07e9fb9a8751923eb876d57a575" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_Payment__oid_paymentMethodId" ON "Payment" ("oid", "paymentMethodId");
            CREATE INDEX "IDX_Payment__oid_moneyDirection" ON "Payment" ("oid", "moneyDirection");
            CREATE INDEX "IDX_Payment__oid_personId" ON "Payment" ("oid", "personId");
            CREATE INDEX "IDX_Payment__oid_voucherId" ON "Payment" ("oid", "voucherId");
            CREATE INDEX "IDX_Payment__oid_createdAt" ON "Payment" ("oid", "createdAt");

            INSERT INTO "Payment" (oid, "paymentMethodId", "voucherType", "voucherId",
                "personType", "personId", "paymentTiming", "createdAt", 
                "moneyDirection", "paidAmount", "debtAmount",
                "openDebt", "closeDebt", "cashierId", "note", "description")
            SELECT oid, "paymentMethodId", ${VoucherType.Receipt}, "receiptId",
                ${PersonType.Distributor}, "distributorId", "paymentType", "createdAt",
                ${MoneyDirection.Out}, -"paid", "debit", 
                "openDebt", "closeDebt", 0 , "note", "description"
            FROM "DistributorPayment";

            INSERT INTO "Payment" (oid, "paymentMethodId", "voucherType", "voucherId",
                "personType", "personId", "paymentTiming", "createdAt", 
                "moneyDirection", "paidAmount", "debtAmount",
                "openDebt", "closeDebt", "cashierId", "note", "description")
            SELECT oid, "paymentMethodId", ${VoucherType.Ticket}, "ticketId",
                ${PersonType.Customer}, "customerId", "paymentType", "createdAt",
                ${MoneyDirection.In}, "paid", "debit",
                "openDebt", "closeDebt", 0 , "note", "description"
            FROM "CustomerPayment";

            DROP TABLE "DistributorPayment" CASCADE;
            DROP TABLE "CustomerPayment" CASCADE;
        `)

        await queryRunner.query(`
            ALTER TABLE "Receipt"
                ADD "deliveryStatus" smallint NOT NULL DEFAULT '2';
            UPDATE  "Receipt"
            SET     "deliveryStatus" = 3,
                    "status" = CASE 
                        WHEN("status" = -1) THEN 7
                        WHEN("status" = 0) THEN 2
                        WHEN("status" = 1) THEN 3
                        WHEN("status" = 2) THEN 5
                        WHEN("status" = 3) THEN 6
                        ELSE 0
                    END;
            `)

        await queryRunner.query(`
            DROP INDEX "public"."IDX_Ticket__oid_ticketStatus";
            ALTER TABLE "Ticket"
                RENAME COLUMN "ticketStatus" TO "status";
            CREATE INDEX "IDX_Ticket__oid_status" ON "Ticket" ("oid", "status");

            ALTER TABLE "Ticket"
                ADD "deliveryStatus" smallint NOT NULL DEFAULT '1';
            UPDATE  "Ticket"
            SET     "deliveryStatus" = CASE 
                        WHEN("status" = 5) THEN 3
                        WHEN("status" = 6) THEN 3
                        ELSE 2
                    END;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

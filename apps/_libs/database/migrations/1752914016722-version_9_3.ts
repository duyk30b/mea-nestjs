import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version931752914016722 implements MigrationInterface {
    name = 'Version931752914016722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const queryArray: string[] = []

        queryArray.push(`
            ALTER TABLE "TicketProcedure"
                ADD "paymentMoneyStatus" smallint NOT NULL DEFAULT '1';
            ALTER TABLE "TicketProduct"
                ADD "paymentMoneyStatus" smallint NOT NULL DEFAULT '1';
            ALTER TABLE "TicketLaboratoryGroup"
                ADD "paymentMoneyStatus" smallint NOT NULL DEFAULT '1';
            ALTER TABLE "TicketRadiology"
                ADD "paymentMoneyStatus" smallint NOT NULL DEFAULT '1';
            ALTER TABLE "TicketLaboratory"
                ADD "paymentMoneyStatus" smallint NOT NULL DEFAULT '1';
        `)

        queryArray.push(`
            DROP INDEX "public"."IDX_Payment__oid_createdAt";
            DROP INDEX "public"."IDX_Payment__oid_moneyDirection";
            DROP INDEX "public"."IDX_Payment__oid_paymentMethodId";
            DROP INDEX "public"."IDX_Payment__oid_personId";
            DROP INDEX "public"."IDX_Payment__oid_voucherId";
            
            ALTER TABLE "Payment" RENAME TO "PaymentItem";
            ALTER SEQUENCE "Payment_id_seq" RENAME TO "PaymentItem_id_seq";

            CREATE INDEX "IDX_PaymentItem__oid_personId" ON "PaymentItem" ("oid", "personId");
            CREATE INDEX "IDX_PaymentItem__oid_voucherId" ON "PaymentItem" ("oid", "voucherId");
            CREATE INDEX "IDX_PaymentItem__oid_createdAt" ON "PaymentItem" ("oid", "createdAt");

            ALTER TABLE "PaymentItem"
                ADD "paymentId" integer NOT NULL DEFAULT '0',
                ADD "paymentPersonType" smallint NOT NULL DEFAULT '0',
                ADD "voucherItemType" smallint NOT NULL DEFAULT '0',
                ADD "voucherItemId" integer NOT NULL DEFAULT '0',
                ADD "paymentInteractId" integer NOT NULL DEFAULT '0';

            UPDATE "PaymentItem"
                SET     "paymentPersonType" = "personType",
                        "note" = CASE 
                                    WHEN("paymentTiming" = 1) THEN 'Tạm ứng'
                                    WHEN("paymentTiming" = 2) THEN 'Hoàn trả'
                                    WHEN("paymentTiming" = 3) THEN 'Đóng phiếu'
                                    WHEN("paymentTiming" = 4) THEN 'Trả nợ'
                                    WHEN("paymentTiming" = 5) THEN 'Mở lại phiếu'
                                    WHEN("paymentTiming" = 10) THEN 'Ghi quỹ'
                                    ELSE ''
                                END,
                        "paidAmount" = CASE 
                                    WHEN("voucherType" = 1) THEN (-"paidAmount")
                                    ELSE "paidAmount"
                                END;

            ALTER TABLE "PaymentItem" 
                DROP COLUMN "paymentMethodId",
                DROP COLUMN "paymentTiming",
                DROP COLUMN "personType",
                DROP COLUMN "moneyDirection",
                DROP COLUMN "description";
        `)

        queryArray.push(`
            CREATE TABLE "Payment" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "paymentMethodId" integer NOT NULL DEFAULT '0',
                "paymentPersonType" smallint NOT NULL DEFAULT '0',
                "personId" integer NOT NULL DEFAULT '0',
                "createdAt" bigint NOT NULL,
                "moneyDirection" smallint NOT NULL,
                "money" bigint NOT NULL DEFAULT '0',
                "cashierId" integer NOT NULL DEFAULT '0',
                "note" character varying(255),
                "reason" character varying(255),
                CONSTRAINT "PK_Payment_Id" PRIMARY KEY ("id")
            );

            CREATE INDEX "IDX_Payment__oid_paymentMethodId" ON "Payment" ("oid", "paymentMethodId");
            CREATE INDEX "IDX_Payment__oid_moneyDirection" ON "Payment" ("oid", "moneyDirection");
            CREATE INDEX "IDX_Payment__oid_personId" ON "Payment" ("oid", "personId");
            CREATE INDEX "IDX_Payment__oid_createdAt" ON "Payment" ("oid", "createdAt");
        `)

        await queryRunner.query(queryArray.join(''))
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

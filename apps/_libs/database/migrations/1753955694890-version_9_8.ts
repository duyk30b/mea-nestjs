import { MigrationInterface, QueryRunner } from 'typeorm'

enum PaymentActionType {
    Other = 0, // Tạm ứng
    PrepaymentMoney = 1, // Tạm ứng
    RefundMoney = 2, // Hoàn trả tiền
    PayDebt = 3, // Trả nợ
    Close = 4, // Đóng phiếu, thường chỉ có thể ghi nợ khi đóng phiếu
    Reopen = 5, // Mở lại phiếu, thường thì chỉ có thể là hoàn trả nợ
    PrepaymentForTicketItemList = 6,
    RefundForTicketItemList = 7,
    FixByExcel = 8,
}

export class Version981753955694890 implements MigrationInterface {
    name = 'Version981753955694890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const queryArray: string[] = []

        queryArray.push(`
            DROP INDEX "public"."IDX_PaymentItem__oid_createdAt";
            DROP INDEX "public"."IDX_PaymentItem__oid_voucherId";
            DROP INDEX "public"."IDX_PaymentItem__oid_personId";

            ALTER TABLE "PaymentItem"
                ADD "paymentMethodId" integer NOT NULL DEFAULT '0',
                ADD "paymentActionType" smallint NOT NULL DEFAULT '0',
                ADD "moneyDirection" smallint NOT NULL DEFAULT '0';

            UPDATE  "PaymentItem"
            SET     "paymentMethodId" = "Payment"."paymentMethodId",
                    "moneyDirection" = "Payment"."moneyDirection"
            FROM    "Payment"
            WHERE   "Payment"."id" = "PaymentItem"."paymentId";

            UPDATE  "PaymentItem"
            SET     "note"  = '',
                    "paymentActionType" = CASE 
                            WHEN("PaymentItem"."note" = 'Hoàn tiền') THEN ${PaymentActionType.RefundMoney}
                            WHEN("PaymentItem"."note" = 'Trả nợ') THEN ${PaymentActionType.PayDebt}
                            WHEN("PaymentItem"."note" = 'Thanh toán') THEN ${PaymentActionType.PrepaymentMoney}
                            WHEN("PaymentItem"."note" = 'Tạm ứng') THEN ${PaymentActionType.PrepaymentMoney}
                            WHEN("PaymentItem"."note" = 'Gửi hàng') THEN ${PaymentActionType.PrepaymentMoney}
                            WHEN("PaymentItem"."note" = 'Mở lại phiếu') THEN ${PaymentActionType.Reopen}
                            WHEN("PaymentItem"."note" = 'Hoàn trả') THEN ${PaymentActionType.RefundMoney}
                            WHEN("PaymentItem"."note" = 'Đóng phiếu') THEN ${PaymentActionType.Close}
                            ELSE ${PaymentActionType.Other}
                        END;
        `)

        queryArray.push(`
            DROP TABLE "Payment" CASCADE;

            ALTER TABLE "PaymentItem" RENAME TO "Payment";
            ALTER SEQUENCE "PaymentItem_id_seq" RENAME TO "Payment_id_seq";

            ALTER TABLE "Payment" 
                DROP COLUMN "discountMoney",
                DROP COLUMN "paymentInteractId",
                DROP COLUMN "expectedPrice",
                DROP COLUMN "voucherItemType",
                DROP COLUMN "discountPercent",
                DROP COLUMN "actualPrice",
                DROP COLUMN "paymentId",
                DROP COLUMN "voucherItemId",
                DROP COLUMN "quantity";

            ALTER TABLE "Payment" RENAME COLUMN "paymentPersonType" TO "personType";
            ALTER TABLE "Payment" ALTER COLUMN "moneyDirection" DROP DEFAULT;
            ALTER TABLE "Payment" ALTER COLUMN "paymentActionType" DROP DEFAULT;

            CREATE INDEX "IDX_Payment__oid_paymentMethodId" ON "Payment" ("oid", "paymentMethodId");
            CREATE INDEX "IDX_Payment__oid_moneyDirection" ON "Payment" ("oid", "moneyDirection");
            CREATE INDEX "IDX_Payment__oid_personId" ON "Payment" ("oid", "personId");
            CREATE INDEX "IDX_Payment__oid_createdAt" ON "Payment" ("oid", "createdAt");
        `)

        queryArray.push(`
            CREATE TABLE "PaymentTicketItem" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "paymentId" integer NOT NULL DEFAULT '0',
                "ticketId" integer NOT NULL DEFAULT '0',
                "ticketItemType" smallint NOT NULL DEFAULT '0',
                "ticketItemId" integer NOT NULL DEFAULT '0',
                "interactId" integer NOT NULL DEFAULT '0',
                "expectedPrice" bigint NOT NULL DEFAULT '0',
                "discountMoney" bigint NOT NULL DEFAULT '0',
                "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                "actualPrice" bigint NOT NULL DEFAULT '0',
                "quantity" integer NOT NULL DEFAULT '1',
                CONSTRAINT "PK_62daf65e19b20485363514fb3cc" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_PaymentTicketItem__oid_paymentId" 
                ON "PaymentTicketItem" ("oid", "paymentId");
        `)
        await queryRunner.query(queryArray.join(''))
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

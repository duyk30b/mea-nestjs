import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version2607251784954301533 implements MigrationInterface {
  name = 'Version2607251784954301533'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction()
    try {
      await queryRunner.query(`
        CREATE TABLE "PaymentPurchaseOrder" (
          "oid" integer NOT NULL,
          "id" bigint NOT NULL,
          "paymentId" bigint NOT NULL,
          "purchaseOrderId" bigint NOT NULL DEFAULT '0',
          "purchaseOrderActionType" smallint NOT NULL DEFAULT '0',
          "paidMoney" integer NOT NULL DEFAULT '0',
          "debtMoney" integer NOT NULL DEFAULT '0',
          "createdAt" bigint NOT NULL DEFAULT '0',
          CONSTRAINT "PK_6aed15f4fc3eba783203f8d0d4e" PRIMARY KEY ("id")
        );
        CREATE INDEX "IDX_PaymentPurchaseOrder__oid_paymentId" ON "PaymentPurchaseOrder" ("oid", "paymentId");
        CREATE INDEX "IDX_PaymentPurchaseOrder__oid_purchaseOrderId" 
            ON "PaymentPurchaseOrder" ("oid", "purchaseOrderId");

        INSERT INTO "PaymentPurchaseOrder" (oid, "id", "paymentId", "purchaseOrderId",
            "purchaseOrderActionType", "paidMoney", "debtMoney", "createdAt"
            )
        SELECT oid, "id", "id", "voucherId",
            "paymentActionType", "paidTotal", "debtTotal", "createdAt"
        FROM "Payment" WHERE "voucherType" = 1;

        UPDATE  "PaymentPurchaseOrder" "ppo"
        SET     "purchaseOrderActionType" = CASE 
                    WHEN("purchaseOrderActionType" = 1) THEN 5
                    WHEN("purchaseOrderActionType" = 2) THEN 7
                    WHEN("purchaseOrderActionType" = 3) THEN 11
                    WHEN("purchaseOrderActionType" = 4) THEN 12
                    WHEN("purchaseOrderActionType" = 5) THEN 9
                    WHEN("purchaseOrderActionType" = 6) THEN 11
                    WHEN("purchaseOrderActionType" = 7) THEN 13
                    WHEN("purchaseOrderActionType" = 8) THEN 0
                    ELSE "purchaseOrderActionType"
                END;
      `)

      // Không dùng id tự động tăng dần nên không có
      // await queryRunner.query(`
      //     ALTER SEQUENCE "PaymentTicketItem_id_seq" RENAME TO "PaymentTicket_id_seq";
      //  `)
      await queryRunner.query(`
        ALTER TABLE "PaymentTicketItem" RENAME TO "PaymentTicket";

        DROP INDEX "public"."IDX_PaymentTicketItem__oid_paymentId";
        CREATE INDEX "IDX_PaymentTicket__oid_paymentId" ON "PaymentTicket" ("oid", "paymentId");
        CREATE INDEX "IDX_PaymentTicket__oid_ticketId" ON "PaymentTicket" ("oid", "ticketId");

        ALTER TABLE "PaymentTicket" RENAME COLUMN "interactId" TO "ticketItemInteractId";
        ALTER TABLE "PaymentTicket" RENAME COLUMN "ticketItemType" TO "paymentTicketItemType";

        ALTER TABLE "PaymentTicket"
          ADD "ticketActionType" smallint NOT NULL DEFAULT '0',
          ADD "createdAt" bigint NOT NULL DEFAULT '0';

        UPDATE  "PaymentTicket" "pt"
        SET     "createdAt"         = "payment"."createdAt",
                "ticketActionType"  = CASE 
                      WHEN("pt"."paidMoney" > 0) THEN -1
                      WHEN("pt"."paidMoney" < 0) THEN -2
                      ELSE "ticketActionType"
                  END
        FROM    "Payment" "payment"
        WHERE   "payment"."id" = "pt"."paymentId" AND "payment"."personType" = 2;

        INSERT INTO "PaymentTicket" (oid, "id", "paymentId", "ticketId", "ticketActionType",
            "paymentTicketItemType", "ticketItemId", "ticketItemInteractId", "sessionIndex",
            "expectedPrice", "discountType", "discountMoney", "discountPercent",
            "actualPrice", "quantity", "unitRate", "paidMoney", "debtMoney", "createdAt"
            )
        SELECT oid, "id", "id", "voucherId", "paymentActionType",
            '0', '0', '0', '0',
            "paidTotal", '%', '0', '0',
            "paidTotal", 1, 1, "paidTotal", "debtTotal", "createdAt"
        FROM "Payment" WHERE "voucherType" = 2 AND "hasPaymentItem" = 0;

        UPDATE  "PaymentTicket" "pt"
        SET     "ticketActionType" = CASE 
                    WHEN("ticketActionType" = -1) THEN 6
                    WHEN("ticketActionType" = -2) THEN 8
                    WHEN("ticketActionType" = 1) THEN 5
                    WHEN("ticketActionType" = 2) THEN 7
                    WHEN("ticketActionType" = 3) THEN 11
                    WHEN("ticketActionType" = 4) THEN 12
                    WHEN("ticketActionType" = 5) THEN 9
                    WHEN("ticketActionType" = 6) THEN 11
                    WHEN("ticketActionType" = 7) THEN 13
                    WHEN("ticketActionType" = 8) THEN 0
                    ELSE "ticketActionType"
                END;
      `)

      await queryRunner.query(`
        ALTER TABLE "Payment" 
          DROP COLUMN "voucherType",
          DROP COLUMN "voucherId",
          DROP COLUMN "hasPaymentItem";
      `)

      await queryRunner.query(`
        ALTER TABLE "TicketPaymentDetail"   
          DROP COLUMN "debtDiscount",
          DROP COLUMN "debtSurcharge",
          DROP COLUMN "debtItem";
      `)

      await queryRunner.query(`
        ALTER TABLE "PurchaseOrder"
        ADD "updatedAt" bigint NOT NULL DEFAULT (
                EXTRACT(
                    epoch
                    FROM now()
                ) * (1000)
            );

        UPDATE  "PurchaseOrder" "po"
        SET     "deliveryStatus" = CASE 
                                      WHEN("deliveryStatus" = 1) THEN 1
                                      WHEN("deliveryStatus" = 2) THEN 2
                                      WHEN("deliveryStatus" = 3) THEN 4
                                      ELSE 0
                                  END,
                "status" = CASE 
                            WHEN("status" = 1) THEN 2
                            WHEN("status" = 2) THEN 1
                            WHEN("status" = 3) THEN 2
                            WHEN("status" = 4) THEN 3
                            WHEN("status" = 5) THEN 4
                            WHEN("status" = 6) THEN 5
                            WHEN("status" = 7) THEN 6
                            ELSE 0
                        END;
      `)

      await queryRunner.query(`
        ALTER TABLE "PurchaseOrderItem" RENAME COLUMN "unitQuantity" TO "quantity";
        ALTER TABLE "PurchaseOrderItem" ADD "quantityCompleted" integer NOT NULL DEFAULT '0';

        UPDATE  "PurchaseOrderItem"
        SET     "quantity" = "quantity" * "unitRate";

        UPDATE  "PurchaseOrderItem" "poi"
        SET     "quantityCompleted" = "quantity"
        FROM    "PurchaseOrder" "po"
        WHERE   "poi"."purchaseOrderId" = "po"."id" AND "po"."deliveryStatus" = 4;
      `)

      await queryRunner.query(`
        UPDATE  "Ticket" "t"
        SET     "deliveryStatus" = CASE 
                                      WHEN("deliveryStatus" = 1) THEN 1
                                      WHEN("deliveryStatus" = 2) THEN 2
                                      WHEN("deliveryStatus" = 3) THEN 4
                                      ELSE 0
                                  END,
                "status" = CASE 
                            WHEN("status" = 1) THEN 2
                            WHEN("status" = 2) THEN 1
                            WHEN("status" = 3) THEN 2
                            WHEN("status" = 4) THEN 3
                            WHEN("status" = 5) THEN 4
                            WHEN("status" = 6) THEN 5
                            WHEN("status" = 7) THEN 6
                            ELSE 0
                        END;

        ALTER TABLE "Ticket" ALTER COLUMN "status" SET DEFAULT '1';
      `)

      await queryRunner.query(`
        ALTER TABLE "TicketProduct" RENAME COLUMN "unitQuantity" TO "quantity";
        ALTER TABLE "TicketProduct" RENAME COLUMN "unitQuantityPrescription" TO "quantityPrescription";
        ALTER TABLE "TicketProduct" RENAME COLUMN "paymentMoneyStatus" TO "ticketItemPaymentType";

        ALTER TABLE "TicketProduct"
          ADD "quantityCompleted" integer NOT NULL DEFAULT '0';

        UPDATE  "TicketProduct"
          SET   "quantity" = "quantity" * "unitRate",
                "quantityPrescription" = "quantityPrescription" * "unitRate";

        UPDATE  "TicketProduct" "tp"
        SET     "quantityCompleted" = CASE 
                                      WHEN("deliveryStatus" = 1) THEN 0
                                      WHEN("deliveryStatus" = 2) THEN 0
                                      WHEN("deliveryStatus" = 3) THEN "quantity"
                                      ELSE 0
                                  END;

        ALTER TABLE "TicketProduct" 
          DROP COLUMN "debt",
          DROP COLUMN "deliveryStatus";
      `)

      await queryRunner.query(`
        ALTER TABLE "TicketBatch" DROP COLUMN "deliveryStatus";
        ALTER TABLE "TicketBatch" RENAME COLUMN "unitQuantity" TO "quantityCompleted";

        UPDATE  "TicketBatch"
        SET     "quantityCompleted" = "quantityCompleted" * "unitRate";
      `)

      await queryRunner.query(`
        ALTER TABLE "TicketLaboratory" DROP COLUMN "debt";
        ALTER TABLE "TicketLaboratory" RENAME COLUMN "paymentMoneyStatus" TO "ticketItemPaymentType";
      `)
      await queryRunner.query(`
        ALTER TABLE "TicketLaboratoryGroup" RENAME COLUMN "paymentMoneyStatus" TO "ticketItemPaymentType";
      `)
      await queryRunner.query(`
        ALTER TABLE "TicketRegimen" 
            DROP COLUMN "debt",
            DROP COLUMN "debtItem";
      `)

      await queryRunner.query(`
        ALTER TABLE "TicketProcedure" DROP COLUMN "debt";
        ALTER TABLE "TicketProcedure" RENAME COLUMN "paymentMoneyStatus" TO "ticketItemPaymentType";
      `)

      await queryRunner.query(`
        ALTER TABLE "TicketRadiology" DROP COLUMN "debt";
        ALTER TABLE "TicketRadiology" RENAME COLUMN "paymentMoneyStatus" TO "ticketItemPaymentType";
      `)

      await queryRunner.query(`
        ALTER TABLE "Customer" ALTER COLUMN "isHasTicket" SET DEFAULT '0';
      `)
      await queryRunner.commitTransaction()
    } catch (error: any) {
      await queryRunner.rollbackTransaction()
      throw error
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

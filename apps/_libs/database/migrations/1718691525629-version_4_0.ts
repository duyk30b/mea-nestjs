import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version401718691525629 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if ('DROP VIEW') {
      await queryRunner.query(`
            DROP VIEW IF EXISTS "view_Batch";
            DROP VIEW IF EXISTS "view_BatchMovement";
            DROP VIEW IF EXISTS "view_Customer";
            DROP VIEW IF EXISTS "view_CustomerPayment";
            DROP VIEW IF EXISTS "view_Distributor";
            DROP VIEW IF EXISTS "view_DistributorPayment";
            DROP VIEW IF EXISTS "view_Invoice";
            DROP VIEW IF EXISTS "view_Organization";
            DROP VIEW IF EXISTS "view_Procedure";
            DROP VIEW IF EXISTS "view_Product";
            DROP VIEW IF EXISTS "view_ProductMovement";
            DROP VIEW IF EXISTS "view_Receipt";
            DROP VIEW IF EXISTS "view_Role";
            DROP VIEW IF EXISTS "view_User";
            `)
    }

    if ('BatchMovement') {
      await queryRunner.query(`
            ALTER TABLE "BatchMovement" RENAME COLUMN "referenceId" TO "voucherId";
            ALTER TABLE "BatchMovement" RENAME COLUMN "type" TO "voucherType";
            ALTER TABLE "BatchMovement" RENAME COLUMN "price" TO "actualPrice";
        `)
      await queryRunner.query(`
            ALTER TABLE "BatchMovement"
              ADD "contactId" integer NOT NULL DEFAULT '0',
              ADD "unitRate" smallint NOT NULL DEFAULT '1',
              ADD "expectedPrice" bigint NOT NULL DEFAULT '0'
          `)
      await queryRunner.query(`
            ALTER TABLE "BatchMovement" 
              DROP COLUMN "unit",
              DROP COLUMN "costAmount",
              DROP COLUMN "openCostAmount",
              DROP COLUMN "closeCostAmount"
          `)
      await queryRunner.query(`
            UPDATE  "BatchMovement" "bm"
            SET     "contactId" = invoice."customerId"
            FROM    "Invoice" "invoice"
            WHERE   "bm"."voucherId" = "invoice"."id" AND "bm"."voucherType" = 2
          `)
      await queryRunner.query(`
            UPDATE  "BatchMovement" "bm"
            SET     "expectedPrice" = ii."expectedPrice"
            FROM    "InvoiceItem" "ii"
            WHERE   "bm"."voucherId" = "ii"."invoiceId" 
                AND "bm"."voucherType" = 2 
                AND "ii"."productId" = "bm"."productId"
                AND "ii"."batchId" = "bm"."batchId"
          `)
      await queryRunner.query(`
            UPDATE  "BatchMovement" "bm"
            SET     "contactId" = receipt."distributorId"
            FROM    "Receipt" "receipt"
            WHERE   "bm"."voucherId" = "receipt"."id" AND "bm"."voucherType" = 1
          `)
      await queryRunner.query(`
            UPDATE  "BatchMovement" "bm"
            SET     "expectedPrice" = bm."actualPrice"
            WHERE   "bm"."voucherType" = 1 
          `)
    }

    if ('Batch') {
      await queryRunner.query(`
            ALTER TABLE "Batch" 
              DROP COLUMN "costAmount",
              DROP COLUMN "createdAt"
          `)
    }

    if ('CustomerPayment') {
      await queryRunner.query(`
            DROP INDEX "public"."IDX_CustomerPayment__invoiceId";
            DROP INDEX "public"."IDX_CustomerPayment__customerId";
        `)
      await queryRunner.query(`
            ALTER TABLE "CustomerPayment" RENAME COLUMN "customerOpenDebt" TO "openDebt";
            ALTER TABLE "CustomerPayment" RENAME COLUMN "customerCloseDebt" TO "closeDebt";
            ALTER TABLE "CustomerPayment" RENAME COLUMN "type" TO "paymentType";
            ALTER TABLE "CustomerPayment" RENAME COLUMN "invoiceId" TO "voucherId";
        `)
      await queryRunner.query(`
            ALTER TABLE "CustomerPayment"
              ADD "voucherType" smallint NOT NULL DEFAULT '0'
          `)
      await queryRunner.query(`
            ALTER TABLE "CustomerPayment" 
              DROP COLUMN "invoiceOpenDebt",
              DROP COLUMN "invoiceCloseDebt"
          `)
      await queryRunner.query(`
            CREATE INDEX "IDX_CustomerPayment__oid_customerId" 
                ON "CustomerPayment" ("oid", "customerId")
        `)
      await queryRunner.query(`
            UPDATE  "CustomerPayment"
            SET     "voucherType" = 2, 
                    "paymentType" = CASE 
                                        WHEN("paymentType" = 0) THEN 1
                                        WHEN("paymentType" = -1) THEN 2
                                        WHEN("paymentType" = 1) THEN 3
                                        WHEN("paymentType" = 2) THEN 4
                                        ELSE 0
                                    END
        `)
    }

    if ('Customer') {
      await queryRunner.query(`
            ALTER TABLE "Customer" DROP COLUMN "createdAt"
        `)
    }

    if ('DistributorPayment') {
      await queryRunner.query(`
            DROP INDEX "public"."IDX_DistributorPayment__distributorId";
            DROP INDEX "public"."IDX_DistributorPayment__receiptId";
        `)
      await queryRunner.query(`
            ALTER TABLE "DistributorPayment" RENAME COLUMN "type" TO "paymentType";
            ALTER TABLE "DistributorPayment" RENAME COLUMN "distributorOpenDebt" TO "openDebt";
            ALTER TABLE "DistributorPayment" RENAME COLUMN "distributorCloseDebt" TO "closeDebt";
        `)
      await queryRunner.query(`
            ALTER TABLE "DistributorPayment" 
              DROP COLUMN "receiptOpenDebt",
              DROP COLUMN "receiptCloseDebt"
          `)
      await queryRunner.query(`
            CREATE INDEX "IDX_DistributorPayment__oid_distributorId" 
                ON "DistributorPayment" ("oid", "distributorId");
            CREATE INDEX "IDX_DistributorPayment__oid_receiptId" 
                ON "DistributorPayment" ("oid", "receiptId");
        `)
      await queryRunner.query(`
            UPDATE  "DistributorPayment"
            SET     "paymentType" = CASE 
                                        WHEN("paymentType" = 0) THEN 1
                                        WHEN("paymentType" = -1) THEN 2
                                        WHEN("paymentType" = 1) THEN 3
                                        WHEN("paymentType" = 2) THEN 4
                                        ELSE 0
                                    END
        `)
    }

    if ('Distributor') {
      await queryRunner.query(`
              ALTER TABLE "Distributor" DROP COLUMN "createdAt"
        `)
    }

    if ('InvoiceItem') {
      await queryRunner.query(`
            ALTER TABLE "InvoiceItem"
              ADD "unitRate" smallint NOT NULL DEFAULT '1'
        `)
      await queryRunner.query(`
            ALTER TABLE "InvoiceItem" 
              DROP COLUMN "unit",
              DROP COLUMN "costPrice"
        `)
    }

    if ('Invoice') {
      await queryRunner.query(`
            ALTER TABLE "Invoice" RENAME COLUMN "shipYear" TO "year";
            ALTER TABLE "Invoice" RENAME COLUMN "shipMonth" TO "month";
            ALTER TABLE "Invoice" RENAME COLUMN "shipDate" TO "date";
            ALTER TABLE "Invoice" RENAME COLUMN "itemsCostMoney" TO "totalCostAmount";
            ALTER TABLE "Invoice" RENAME COLUMN "revenue" TO "totalMoney";
            ALTER TABLE "Invoice" RENAME COLUMN "shippedAt" TO "endedAt";
        `)
      await queryRunner.query(`
            ALTER TABLE "Invoice" 
              DROP COLUMN "arrivalId"
          `)
    }

    if ('Procedure') {
      await queryRunner.query(`
                ALTER TABLE "Procedure" DROP COLUMN "createdAt"
          `)
    }

    if ('ProductMovement') {
      await queryRunner.query(`
            DROP INDEX "public"."IDX_ProductMovement__oid_productId_createdAt";
        `)
      await queryRunner.query(`
              ALTER TABLE "ProductMovement" RENAME COLUMN "referenceId" TO "voucherId";
              ALTER TABLE "ProductMovement" RENAME COLUMN "type" TO "voucherType";
              ALTER TABLE "ProductMovement" RENAME COLUMN "price" TO "actualPrice";
          `)
      await queryRunner.query(`
              ALTER TABLE "ProductMovement"
                ADD "contactId" integer NOT NULL DEFAULT '0',
                ADD "unitRate" smallint NOT NULL DEFAULT '1',
                ADD "expectedPrice" bigint NOT NULL DEFAULT '0'
            `)
      await queryRunner.query(`
              ALTER TABLE "ProductMovement" 
                DROP COLUMN "unit"
            `)
      await queryRunner.query(`
                CREATE INDEX "IDX_ProductMovement__oid_productId_id" 
                    ON "ProductMovement" ("oid", "productId", "id");
                CREATE INDEX "IDX_ProductMovement__oid_contactId_voucherType_id" 
                    ON "ProductMovement" ("oid", "contactId", "voucherType", "id");
            `)
      await queryRunner.query(`
              UPDATE  "ProductMovement" "pm"
              SET     "contactId" = invoice."customerId"
              FROM    "Invoice" "invoice"
              WHERE   "pm"."voucherId" = "invoice"."id" AND "pm"."voucherType" = 2
            `)
      await queryRunner.query(`
              UPDATE  "ProductMovement" "pm"
              SET     "expectedPrice" = ii."expectedPrice"
              FROM    "InvoiceItem" "ii"
              WHERE   "pm"."voucherId" = "ii"."invoiceId" 
                  AND "pm"."voucherType" = 2 
                  AND "ii"."productId" = "pm"."productId"
            `)
      await queryRunner.query(`
              UPDATE  "ProductMovement" "pm"
              SET     "contactId" = receipt."distributorId"
              FROM    "Receipt" "receipt"
              WHERE   "pm"."voucherId" = "receipt"."id" AND "pm"."voucherType" = 1
            `)
      await queryRunner.query(`
              UPDATE  "ProductMovement" "pm"
              SET     "expectedPrice" = pm."actualPrice"
              WHERE   "pm"."voucherType" = 1 
            `)
    }

    if ('Product') {
      await queryRunner.query(`
                  ALTER TABLE "Product" DROP COLUMN "createdAt"
            `)
    }

    if ('ReceiptItem') {
      await queryRunner.query(`
              ALTER TABLE "ReceiptItem"
                ADD "unitRate" smallint NOT NULL DEFAULT '1'
          `)
      await queryRunner.query(`
              ALTER TABLE "ReceiptItem" DROP COLUMN "unit"
          `)
    }

    if ('Receipt') {
      await queryRunner.query(`
              ALTER TABLE "Receipt" RENAME COLUMN "shipYear" TO "year";
              ALTER TABLE "Receipt" RENAME COLUMN "shipMonth" TO "month";
              ALTER TABLE "Receipt" RENAME COLUMN "shipDate" TO "date";
              ALTER TABLE "Receipt" RENAME COLUMN "revenue" TO "totalMoney";
              ALTER TABLE "Receipt" RENAME COLUMN "shippedAt" TO "endedAt";
          `)
    }

    if ('Role') {
      await queryRunner.query(`
            ALTER TABLE "Role" DROP COLUMN "createdAt"
        `)
    }

    if ('User') {
      await queryRunner.query(`
              ALTER TABLE "User" DROP COLUMN "createdAt"
          `)
    }

    if ('VisitBatch') {
      await queryRunner.query(`
        CREATE TABLE "VisitBatch" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "visitId" integer NOT NULL,
            "productId" integer NOT NULL,
            "batchId" integer NOT NULL,
            "visitProductId" integer NOT NULL,
            "quantity" numeric(10, 3) NOT NULL DEFAULT '0',
            CONSTRAINT "PK_5167e3d8c659363de9465de547f" PRIMARY KEY ("id")
        )
      `)
      await queryRunner.query(`
          CREATE INDEX "IDX_VisitBatch__oid_visitId" ON "VisitBatch" ("oid", "visitId")
      `)
    }

    if ('VisitDiagnosis') {
      await queryRunner.query(`
        CREATE TABLE "VisitDiagnosis" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "visitId" integer NOT NULL,
            "reason" character varying NOT NULL DEFAULT '',
            "healthHistory" text NOT NULL DEFAULT '',
            "summary" text NOT NULL DEFAULT '',
            "diagnosis" character varying NOT NULL DEFAULT '',
            "vitalSigns" text NOT NULL DEFAULT '{}',
            "advice" text NOT NULL DEFAULT '',
            CONSTRAINT "PK_2f36d57144558fd6bbc7b304f66" PRIMARY KEY ("id")
        )
      `)
      await queryRunner.query(`
          CREATE INDEX "IDX_VisitDiagnosis__oid_visitId" ON "VisitDiagnosis" ("oid", "visitId")
      `)
    }

    if ('VisitProcedure') {
      await queryRunner.query(`
        CREATE TABLE "VisitProcedure" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "visitId" integer NOT NULL,
            "customerId" integer NOT NULL,
            "procedureId" integer NOT NULL DEFAULT '0',
            "quantity" integer NOT NULL DEFAULT '0',
            "expectedPrice" bigint NOT NULL DEFAULT '0',
            "discountMoney" bigint NOT NULL DEFAULT '0',
            "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
            "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
            "actualPrice" bigint NOT NULL DEFAULT '0',
            "createdAt" bigint,
            CONSTRAINT "PK_81f88be9ddf625db0f23cd65a2d" PRIMARY KEY ("id")
        )
    `)
      await queryRunner.query(`
          CREATE INDEX "IDX_VisitProcedure__oid_procedureId" 
              ON "VisitProcedure" ("oid", "procedureId");
          CREATE INDEX "IDX_VisitProcedure__oid_visitId" 
              ON "VisitProcedure" ("oid", "visitId");
      `)
    }

    if ('VisitProduct') {
      await queryRunner.query(`
        CREATE TABLE "VisitProduct" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "visitId" integer NOT NULL,
            "productId" integer NOT NULL,
            "isSent" smallint NOT NULL DEFAULT '0',
            "unitRate" smallint NOT NULL DEFAULT '1',
            "quantityPrescription" integer NOT NULL DEFAULT '0',
            "quantity" numeric(10, 3) NOT NULL DEFAULT '0',
            "costAmount" bigint NOT NULL DEFAULT '0',
            "expectedPrice" bigint NOT NULL DEFAULT '0',
            "discountMoney" bigint NOT NULL DEFAULT '0',
            "discountPercent" numeric(5, 3) NOT NULL DEFAULT '0',
            "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
            "actualPrice" bigint NOT NULL DEFAULT '0',
            "hintUsage" character varying(255),
            CONSTRAINT "PK_7c82eb98f925f1747ddb65cd27c" PRIMARY KEY ("id")
        )
      `)
      await queryRunner.query(`
          CREATE INDEX "IDX_VisitProduct__oid_visitId" ON "VisitProduct" ("oid", "visitId")
      `)
    }

    if ('Visit') {
      await queryRunner.query(`
        CREATE TABLE "Visit" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "customerId" integer NOT NULL,
            "year" smallint,
            "month" smallint,
            "date" smallint,
            "visitStatus" smallint NOT NULL DEFAULT '2',
            "isSent" smallint NOT NULL DEFAULT '0',
            "totalCostAmount" bigint NOT NULL DEFAULT '0',
            "proceduresMoney" bigint NOT NULL DEFAULT '0',
            "productsMoney" bigint NOT NULL DEFAULT '0',
            "discountMoney" bigint NOT NULL DEFAULT '0',
            "discountPercent" numeric(5, 3) NOT NULL DEFAULT '0',
            "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
            "totalMoney" bigint NOT NULL DEFAULT '0',
            "profit" bigint NOT NULL DEFAULT '0',
            "paid" bigint NOT NULL DEFAULT '0',
            "debt" bigint NOT NULL DEFAULT '0',
            "registeredAt" bigint,
            "startedAt" bigint,
            "endedAt" bigint,
            "updatedAt" bigint NOT NULL DEFAULT (
                EXTRACT(
                    epoch
                    FROM now()
                ) * (1000)
            ),
            CONSTRAINT "PK_2593e240bb2c550f229204af296" PRIMARY KEY ("id")
        )
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_Visit__oid_debt" ON "Visit" ("oid", "visitStatus");
        CREATE INDEX "IDX_Visit__oid_customerId" ON "Visit" ("oid", "customerId");
        CREATE INDEX "IDX_Visit__oid_registeredAt" ON "Visit" ("oid", "registeredAt");
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

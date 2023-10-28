import { MigrationInterface, QueryRunner } from 'typeorm'

export class ManageBatch1714791391583 implements MigrationInterface {
  name = 'ManageBatch1714791391583'

  public async up(queryRunner: QueryRunner): Promise<void> {
    if ('Batch') {
      await queryRunner.query(`
        DROP INDEX "public"."IDX_ProductBatch__oid_productId";
        DROP INDEX "public"."IDX_ProductBatch__oid_updatedAt";
        DROP INDEX "public"."IDX_ProductBatch__quantity"
      `)
      await queryRunner.query(`
        ALTER TABLE "ProductBatch" RENAME TO "Batch";
        ALTER SEQUENCE "ProductBatch_id_seq" RENAME TO "Batch_id_seq"
      `)
      await queryRunner.query(`
        ALTER TABLE "Batch" RENAME COLUMN "quantity" TO "quantity_integer";
        ALTER TABLE "Batch" RENAME COLUMN "batch" TO "lotNumber";
      `)
      await queryRunner.query(`
        ALTER TABLE "Batch"
          ADD "costAmount" bigint NOT NULL DEFAULT '0',
          ADD "quantity" DECIMAL(10,3) NOT NULL DEFAULT '0'
      `)
      await queryRunner.query(`
        UPDATE  "Batch"
        SET     "costAmount" = "costPrice" * "quantity_integer",
                "quantity" = "quantity_integer"
      `)
      await queryRunner.query(`
        ALTER TABLE "Batch" 
          DROP COLUMN "wholesalePrice",
          DROP COLUMN "retailPrice",
          DROP COLUMN "deletedAt",
          DROP COLUMN "quantity_integer"
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_Batch__oid_productId" ON "Batch" ("oid", "productId");
        CREATE INDEX "IDX_Batch__oid_updatedAt" ON "Batch" ("oid", "updatedAt");
      `)
    }

    if ('Product') {
      await queryRunner.query(`
        ALTER TABLE "Product" RENAME COLUMN "lastCostPrice" TO "costPrice";
        ALTER TABLE "Product" RENAME COLUMN "lastWholesalePrice" TO "wholesalePrice";
        ALTER TABLE "Product" RENAME COLUMN "lastRetailPrice" TO "retailPrice";
        ALTER TABLE "Product" RENAME COLUMN "quantity" TO "quantity_integer"
      `)

      await queryRunner.query(`
        ALTER TABLE "Product"
          ADD "hasManageQuantity" smallint NOT NULL DEFAULT '1',
          ADD "hasManageBatches" smallint NOT NULL DEFAULT '0',
          ADD "costAmount" bigint NOT NULL DEFAULT '0',
          ADD "quantity" DECIMAL(10,3) NOT NULL DEFAULT '0'
      `)
      await queryRunner.query(`
        UPDATE  "Product" "product"
        SET     "quantity" = "quantity_integer",
                "hasManageBatches" = 1,
                "costAmount" = "sb"."sumCostAmount"
        FROM    ( 
          SELECT "productId", SUM("costAmount") as "sumCostAmount" 
              FROM "Batch"
              GROUP BY "productId" 
          ) AS "sb" 
        WHERE "product"."id" = "sb"."productId"
      `)
      await queryRunner.query(`
        ALTER TABLE "Product" 
          DROP COLUMN "lastExpiryDate",
          DROP COLUMN "quantity_integer"
      `)
    }

    if ('BatchMovement') {
      await queryRunner.query(`
        DROP INDEX "public"."IDX_ProductMovement__oid_productId_createTime";
        DROP INDEX "public"."IDX_ProductMovement__oid_productBatchId_createTime"
      `)
      await queryRunner.query(`
        ALTER TABLE "ProductMovement" RENAME TO "BatchMovement";
        ALTER SEQUENCE "ProductMovement_id_seq" RENAME TO "BatchMovement_id_seq"
      `)
      await queryRunner.query(`
        ALTER TABLE "BatchMovement" RENAME COLUMN "productBatchId" TO "batchId";
        ALTER TABLE "BatchMovement" RENAME COLUMN "createTime" TO "createdAt";
        ALTER TABLE "BatchMovement" RENAME COLUMN "totalMoney" TO "costAmount";
        ALTER TABLE "BatchMovement" RENAME COLUMN "openQuantity" TO "openQuantity_integer";
        ALTER TABLE "BatchMovement" RENAME COLUMN "closeQuantity" TO "closeQuantity_integer";
      `)
      await queryRunner.query(`
        ALTER TABLE "BatchMovement"
          ADD "quantity" DECIMAL(10,3) NOT NULL DEFAULT '0',
          ADD "openQuantity" DECIMAL(10,3) NOT NULL DEFAULT '0',
          ADD "closeQuantity" DECIMAL(10,3) NOT NULL DEFAULT '0',
          ADD "openCostAmount" bigint NOT NULL DEFAULT '0',
          ADD "closeCostAmount" bigint NOT NULL DEFAULT '0'
      `)
      await queryRunner.query(`
        UPDATE  "BatchMovement"
        SET     "quantity" = "number",
                "openQuantity" = "openQuantity_integer",
                "closeQuantity" = "closeQuantity_integer"
      `)
      await queryRunner.query(`
        ALTER TABLE "BatchMovement" 
          DROP COLUMN "number",
          DROP COLUMN "openQuantity_integer",
          DROP COLUMN "closeQuantity_integer"
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_BatchMovement__oid_productId_batchId_createdAt" 
          ON "BatchMovement" ("oid", "productId", "batchId", "createdAt")
      `)
    }

    if ('ProductMovement') {
      await queryRunner.query(`
        CREATE TABLE "ProductMovement" (
          "oid" integer NOT NULL,
          "id" SERIAL NOT NULL,
          "productId" integer NOT NULL,
          "referenceId" integer NOT NULL,
          "type" smallint NOT NULL,
          "isRefund" smallint NOT NULL DEFAULT '0',
          "openQuantity" DECIMAL(10,3) NOT NULL DEFAULT '0',
          "quantity" DECIMAL(10,3) NOT NULL DEFAULT '0',
          "closeQuantity" DECIMAL(10,3) NOT NULL DEFAULT '0',
          "unit" character varying(255) NOT NULL DEFAULT '{"name":"","rate":1}',
          "price" bigint NOT NULL DEFAULT '0',
          "openCostAmount" bigint NOT NULL DEFAULT '0',
          "costAmount" bigint NOT NULL DEFAULT '0',
          "closeCostAmount" bigint NOT NULL DEFAULT '0',
          "createdAt" bigint NOT NULL,
          CONSTRAINT "PK_e98b19cbc09f94a173599b7a6c5" PRIMARY KEY ("id")
        )
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_ProductMovement__oid_productId_createdAt" 
          ON "ProductMovement" ("oid", "productId", "createdAt")
      `)
    }

    if ('ReceiptItem') {
      await queryRunner.query(`
        DROP INDEX "public"."IDX_ReceiptItem__oid_productBatchId"
      `)
      await queryRunner.query(`
        ALTER TABLE "ReceiptItem" RENAME COLUMN "productBatchId" TO "batchId";
        ALTER TABLE "ReceiptItem" RENAME COLUMN "quantity" TO "quantity_integer";
      `)
      await queryRunner.query(`
        ALTER TABLE "ReceiptItem"
          ADD "productId" integer NOT NULL DEFAULT '0',
          ADD "quantity" DECIMAL(10,3) NOT NULL DEFAULT '0'
      `)
      await queryRunner.query(`
        UPDATE  "ReceiptItem" "receiptItem"
        SET     "quantity" = "quantity_integer",
                "productId" = "batch"."productId"
        FROM    "Batch" "batch"
        WHERE   "batch"."id" = "receiptItem"."batchId"
      `)
      await queryRunner.query(`
        ALTER TABLE "ReceiptItem" 
          DROP COLUMN "quantity_integer"
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_ReceiptItem__oid_batchId" ON "ReceiptItem" ("oid", "batchId");
        CREATE INDEX "IDX_ReceiptItem__oid_productId" ON "ReceiptItem" ("oid", "productId")
      `)
    }

    if ('Receipt') {
      await queryRunner.query(`
        DROP INDEX "public"."IDX_Receipt__oid_time"
      `)
      await queryRunner.query(`
        ALTER TABLE "Receipt"
          ADD "shippedAt" bigint NULL
      `)
      await queryRunner.query(`
        ALTER TABLE "Receipt" RENAME COLUMN "time" TO "startedAt";
        ALTER TABLE "Receipt" RENAME COLUMN "delete_time" TO "deletedAt";
      `)
      await queryRunner.query(`
        UPDATE  "Receipt"
        SET     "shippedAt" = EXTRACT(EPOCH FROM "shipTime") * 1000
      `)
      await queryRunner.query(`
        ALTER TABLE "Receipt" 
          DROP COLUMN "shipTime"
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_Receipt__oid_startedAt" ON "Receipt" ("oid", "startedAt")
      `)
    }

    if ('InvoiceItem') {
      await queryRunner.query(`
        DROP INDEX "public"."IDX_InvoiceItem__referenceId"
      `)
      await queryRunner.query(`
        ALTER TABLE "InvoiceItem" RENAME COLUMN "quantity" TO "quantity_integer";
      `)
      await queryRunner.query(`
        ALTER TABLE "InvoiceItem"
          ADD "productId" integer NOT NULL DEFAULT '0',
          ADD "batchId" integer NOT NULL DEFAULT '0',
          ADD "procedureId" integer NOT NULL DEFAULT '0',
          ADD "costAmount" bigint NOT NULL DEFAULT '0',
          ADD "quantity" DECIMAL(10,3) NOT NULL DEFAULT '0'
      `)
      await queryRunner.query(`
        UPDATE  "InvoiceItem" "invoiceItem"
        SET     "quantity" = "quantity_integer",
                "costAmount" = "quantity_integer" * "costPrice",
                "procedureId" = ( CASE WHEN type = 2 THEN "referenceId" ELSE 0 END )
      `)
      await queryRunner.query(`
        UPDATE  "InvoiceItem" "invoiceItem"
        SET     "batchId" = ( CASE WHEN type = 1 THEN "referenceId" ELSE 0 END ),
                "productId" = ( CASE WHEN type = 1 THEN "batch"."productId" ELSE 0 END )
        FROM    "Batch" "batch"
        WHERE   "batch"."id" = "invoiceItem"."referenceId" AND "invoiceItem"."type" = 1
      `)
      await queryRunner.query(`
        ALTER TABLE "InvoiceItem" 
          DROP COLUMN "quantity_integer",
          DROP COLUMN "referenceId"
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_InvoiceItem__oid_procedureId" ON "InvoiceItem" ("oid", "procedureId");
        CREATE INDEX "IDX_InvoiceItem__oid_batchId" ON "InvoiceItem" ("oid", "batchId");
        CREATE INDEX "IDX_InvoiceItem__oid_productId" ON "InvoiceItem" ("oid", "productId")
      `)
    }

    if ('Invoice') {
      await queryRunner.query(`
        DROP INDEX "public"."IDX_Invoice__oid_time"
      `)
      await queryRunner.query(`
        ALTER TABLE "Invoice"
          ADD "shippedAt" bigint NULL
      `)
      await queryRunner.query(`
        ALTER TABLE "Invoice" RENAME COLUMN "time" TO "startedAt";
        ALTER TABLE "Invoice" RENAME COLUMN "deleteTime" TO "deletedAt";
      `)
      await queryRunner.query(`
        UPDATE  "Invoice"
        SET     "shippedAt" = EXTRACT(EPOCH FROM "shipTime") * 1000
      `)
      await queryRunner.query(`
        ALTER TABLE "Invoice" 
          DROP COLUMN "shipTime"
      `)
      await queryRunner.query(`
        CREATE INDEX "IDX_Invoice__oid_startedAt" ON "Invoice" ("oid", "startedAt")
      `)
    }

    if ('CustomerPayment and DistributorPayment') {
      await queryRunner.query(`
        ALTER TABLE "CustomerPayment" RENAME COLUMN "time" TO "createdAt"
      `)
      await queryRunner.query(`
        ALTER TABLE "DistributorPayment" RENAME COLUMN "time" TO "createdAt"
      `)
    }

    if ('Organization') {
      for (const table of ['Organization']) {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION set_updatedAt_${table}_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW."updatedAt" = EXTRACT(EPOCH FROM NOW()) * 1000;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `)

        await queryRunner.query(`
            CREATE TRIGGER set_updatedAt_${table}_trigger
            BEFORE UPDATE ON "${table}"
            FOR EACH ROW
            EXECUTE FUNCTION set_updatedAt_${table}_column();
        `)
      }
    }

    if ('Role') {
      await queryRunner.query(`
        ALTER TABLE "Role" DROP COLUMN "deletedAt"
      `)
    }

    if ('View') {
      for (const table of ['Distributor', 'Organization', 'Procedure', 'Product', 'User']) {
        await queryRunner.query(`
            CREATE VIEW "view_${table}" AS
            SELECT *, 
                TO_TIMESTAMP("createdAt" / 1000.0) AS "createdTime",
                TO_TIMESTAMP("updatedAt" / 1000.0) AS "updatedTime",
                TO_TIMESTAMP("deletedAt" / 1000.0) AS "deletedTime"
            FROM "${table}";
        `)
      }
      await queryRunner.query(`
          CREATE VIEW "view_Role" AS
          SELECT *, 
              TO_TIMESTAMP("createdAt" / 1000.0) AS "createdTime",
              TO_TIMESTAMP("updatedAt" / 1000.0) AS "updatedTime"
          FROM "Role";
      `)

      await queryRunner.query(`
          CREATE VIEW "view_Customer" AS
          SELECT *, 
              TO_TIMESTAMP("createdAt" / 1000.0) AS "createdTime",
              TO_TIMESTAMP("updatedAt" / 1000.0) AS "updatedTime",
              TO_TIMESTAMP("deletedAt" / 1000.0) AS "deletedTime",
              TO_TIMESTAMP("birthday" / 1000) AS "birthdayTime"
          FROM "Customer";
      `)

      await queryRunner.query(`
          CREATE VIEW "view_Batch" AS
          SELECT *, 
              TO_TIMESTAMP("createdAt" / 1000.0) AS "createdTime",
              TO_TIMESTAMP("updatedAt" / 1000.0) AS "updatedTime",
              TO_TIMESTAMP("expiryDate" / 1000) AS "expiryDateTime"
          FROM "Batch";
      `)

      for (const table of ['Receipt', 'Invoice']) {
        await queryRunner.query(`
            CREATE VIEW "view_${table}" AS
            SELECT *, 
                TO_TIMESTAMP("startedAt" / 1000.0) AS "startedTime",
                TO_TIMESTAMP("deletedAt" / 1000.0) AS "deletedTime",
                TO_TIMESTAMP("shippedAt" / 1000.0) AS "shippedTime"
            FROM "${table}";
        `)
      }
      for (const table of [
        'DistributorPayment',
        'CustomerPayment',
        'ProductMovement',
        'BatchMovement',
      ]) {
        await queryRunner.query(`
            CREATE VIEW "view_${table}" AS
            SELECT *, 
                TO_TIMESTAMP("createdAt" / 1000.0) AS "createdTime"
            FROM "${table}";
        `)
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

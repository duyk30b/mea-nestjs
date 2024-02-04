import { MigrationInterface, QueryRunner } from 'typeorm'

export class initPostgres1702313319849 implements MigrationInterface {
  name = 'initPostgres1702313319849'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "Customer" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "fullName" character varying(255) NOT NULL,
                "phone" character(10),
                "birthday" bigint,
                "gender" smallint,
                "identityCard" character varying(255),
                "addressProvince" character varying(255),
                "addressDistrict" character varying(255),
                "addressWard" character varying(255),
                "addressStreet" character varying(255),
                "relative" character varying(255),
                "healthHistory" text,
                "debt" bigint NOT NULL DEFAULT '0',
                "note" character varying(255),
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_60596e16740e1fa20dbf0154ec7" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "InvoiceExpense" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "invoiceId" integer NOT NULL,
                "key" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "money" bigint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_85b52fa6ce4a86c5a086cfb37d5" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_InvoiceExpense__invoiceId" ON "InvoiceExpense" ("oid", "invoiceId")
        `)
    await queryRunner.query(`
            CREATE TABLE "Procedure" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "group" character varying(255),
                "price" integer,
                "consumableHint" text,
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_3e2a7fe9e5fe891d676042f1f8b" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "Product" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "brandName" character varying(255) NOT NULL,
                "substance" character varying(255),
                "quantity" integer NOT NULL DEFAULT '0',
                "group" character varying(255),
                "unit" text NOT NULL DEFAULT '[]',
                "route" character varying(255),
                "source" character varying(255),
                "image" character varying(255),
                "hintUsage" character varying(255),
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_9fc040db7872192bbc26c515710" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Product__oid_group" ON "Product" ("oid", "group")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Product__oid_substance" ON "Product" ("oid", "substance")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Product__oid_brandName" ON "Product" ("oid", "brandName")
        `)
    await queryRunner.query(`
            CREATE TABLE "ProductBatch" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "productId" integer NOT NULL,
                "batch" character varying(255) NOT NULL DEFAULT '',
                "expiryDate" bigint,
                "costPrice" bigint NOT NULL DEFAULT '0',
                "wholesalePrice" bigint NOT NULL DEFAULT '0',
                "retailPrice" bigint NOT NULL DEFAULT '0',
                "quantity" integer NOT NULL DEFAULT '0',
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_946fbf0439b45dc5d867ac1788d" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_ProductBatch__oid_productId" ON "ProductBatch" ("oid", "productId")
        `)
    await queryRunner.query(`
            CREATE TABLE "InvoiceItem" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "invoiceId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "referenceId" integer NOT NULL,
                "type" smallint NOT NULL,
                "unit" character varying(255) NOT NULL DEFAULT '{"name":"","rate":1}',
                "costPrice" bigint,
                "expectedPrice" bigint,
                "discountMoney" bigint NOT NULL DEFAULT '0',
                "discountPercent" smallint NOT NULL DEFAULT '0',
                "discountType" character varying(255) NOT NULL DEFAULT 'VNĐ',
                "actualPrice" bigint NOT NULL,
                "quantity" integer NOT NULL DEFAULT '0',
                "hintUsage" character varying(255),
                CONSTRAINT "PK_fe59f574f9f138df4b52fb7ee7a" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_InvoiceItem__referenceId" ON "InvoiceItem" ("oid", "referenceId")
        `)
    await queryRunner.query(`
      CREATE INDEX "IDX_InvoiceItem__customerId_type" ON "InvoiceItem" ("oid", "customerId", "type")
    `)
    await queryRunner.query(`
            CREATE INDEX "IDX_InvoiceItem__invoiceId" ON "InvoiceItem" ("oid", "invoiceId")
        `)
    await queryRunner.query(`
            CREATE TABLE "InvoiceSurcharge" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "invoiceId" integer NOT NULL,
                "key" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "money" bigint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_7e4dd54ddb4b2e7cbbd9411ca47" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
      CREATE INDEX "IDX_InvoiceSurcharge__invoiceId" ON "InvoiceSurcharge" ("oid", "invoiceId")
    `)
    await queryRunner.query(`
            CREATE TABLE "Invoice" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "arrivalId" integer NOT NULL DEFAULT '0',
                "customerId" integer NOT NULL,
                "status" smallint NOT NULL DEFAULT '1',
                "time" bigint,
                "shipTime" TIMESTAMP WITH TIME ZONE,
                "shipYear" smallint,
                "shipMonth" smallint,
                "shipDate" smallint,
                "deleteTime" bigint,
                "itemsCostMoney" bigint NOT NULL,
                "itemsActualMoney" bigint NOT NULL,
                "discountMoney" bigint NOT NULL DEFAULT '0',
                "discountPercent" smallint NOT NULL DEFAULT '0',
                "discountType" character varying(255) NOT NULL DEFAULT 'VNĐ',
                "surcharge" bigint NOT NULL DEFAULT '0',
                "revenue" bigint NOT NULL,
                "expense" bigint NOT NULL DEFAULT '0',
                "profit" bigint NOT NULL,
                "paid" bigint NOT NULL DEFAULT '0',
                "debt" bigint NOT NULL DEFAULT '0',
                "note" character varying(255),
                CONSTRAINT "PK_0ead03cb5a20e5a5cc4d6defbe6" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Invoice__oid_time" ON "Invoice" ("oid", "time")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Invoice__oid_customerId" ON "Invoice" ("oid", "customerId")
        `)
    await queryRunner.query(`
            CREATE TABLE "CustomerPayment" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "customerId" integer NOT NULL,
                "invoiceId" integer NOT NULL,
                "time" bigint NOT NULL,
                "type" smallint NOT NULL,
                "paid" bigint NOT NULL,
                "debit" bigint NOT NULL,
                "customerOpenDebt" bigint NOT NULL,
                "customerCloseDebt" bigint NOT NULL,
                "invoiceOpenDebt" bigint NOT NULL,
                "invoiceCloseDebt" bigint NOT NULL,
                "note" character varying(255),
                "description" character varying(255),
                CONSTRAINT "PK_6ad6ff939ec685a555ba130e91b" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_CustomerPayment__invoiceId" ON "CustomerPayment" ("oid", "invoiceId")
        `)
    await queryRunner.query(`
      CREATE INDEX "IDX_CustomerPayment__customerId" ON "CustomerPayment" ("oid", "customerId")
    `)
    await queryRunner.query(`
            CREATE TABLE "Distributor" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "fullName" character varying(255) NOT NULL,
                "phone" character(10),
                "addressProvince" character varying(255),
                "addressDistrict" character varying(255),
                "addressWard" character varying(255),
                "addressStreet" character varying(255),
                "debt" bigint NOT NULL DEFAULT '0',
                "note" character varying(255),
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_737b15b84f8d592f19f2ebe44c1" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "ReceiptItem" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "receiptId" integer NOT NULL,
                "distributorId" integer NOT NULL,
                "productBatchId" integer NOT NULL,
                "unit" character varying(255) NOT NULL DEFAULT '{"name":"","rate":1}',
                "costPrice" bigint NOT NULL DEFAULT '0',
                "quantity" integer NOT NULL,
                CONSTRAINT "PK_63dbeaf2451849f0f8b492ea3e5" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_ReceiptItem__oid_receiptId" ON "ReceiptItem" ("oid", "receiptId")
        `)
    await queryRunner.query(`
      CREATE INDEX "IDX_ReceiptItem__oid_productBatchId" ON "ReceiptItem" ("oid", "productBatchId")
    `)
    await queryRunner.query(`
            CREATE TABLE "Receipt" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "distributorId" integer NOT NULL,
                "status" smallint NOT NULL,
                "time" bigint,
                "shipTime" TIMESTAMP WITH TIME ZONE,
                "shipYear" smallint,
                "shipMonth" smallint,
                "shipDate" smallint,
                "delete_time" bigint,
                "itemsActualMoney" bigint NOT NULL,
                "discountMoney" bigint NOT NULL DEFAULT '0',
                "discountPercent" smallint NOT NULL DEFAULT '0',
                "discountType" character varying(255) NOT NULL DEFAULT 'VNĐ',
                "surcharge" bigint NOT NULL DEFAULT '0',
                "revenue" bigint NOT NULL,
                "paid" bigint NOT NULL DEFAULT '0',
                "debt" bigint NOT NULL DEFAULT '0',
                "note" character varying(255),
                CONSTRAINT "PK_83a8032351433085916cc8318b0" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Receipt__oid_time" ON "Receipt" ("oid", "time")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Receipt__oid_distributorId" ON "Receipt" ("oid", "distributorId")
        `)
    await queryRunner.query(`
            CREATE TABLE "DistributorPayment" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "distributorId" integer NOT NULL,
                "receiptId" integer NOT NULL,
                "time" bigint NOT NULL,
                "type" smallint NOT NULL,
                "paid" bigint NOT NULL,
                "debit" bigint NOT NULL,
                "distributorOpenDebt" bigint NOT NULL,
                "distributorCloseDebt" bigint NOT NULL,
                "receiptOpenDebt" bigint NOT NULL,
                "receiptCloseDebt" bigint NOT NULL,
                "note" character varying(255),
                "description" character varying(255),
                CONSTRAINT "PK_8d73835f7daa04601034352cdbf" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
      CREATE INDEX "IDX_DistributorPayment__receiptId" ON "DistributorPayment" ("oid", "receiptId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_DistributorPayment__distributorId"
        ON "DistributorPayment" ("oid", "distributorId")
    `)
    await queryRunner.query(`
            CREATE TABLE "Organization" (
                "id" SERIAL NOT NULL,
                "phone" character(10) NOT NULL,
                "email" character varying(255) NOT NULL,
                "level" smallint NOT NULL DEFAULT '0',
                "organizationName" character varying(255),
                "addressProvince" character varying(255),
                "addressDistrict" character varying(255),
                "addressWard" character varying(255),
                "addressStreet" character varying(255),
                "createTime" bigint,
                CONSTRAINT "PK_67bcafc78935cd441a054c6d4ea" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_Organization__email" ON "Organization" ("email")
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_Organization__phone" ON "Organization" ("phone")
        `)
    await queryRunner.query(`
            CREATE TABLE "OrganizationSetting" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "type" character varying(255) NOT NULL,
                "data" text NOT NULL,
                CONSTRAINT "PK_af7a055340404ea37600febbbb4" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_OrganizationSetting__type" ON "OrganizationSetting" ("oid", "type")
    `)
    await queryRunner.query(`
            CREATE TABLE "ProductMovement" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "productId" integer NOT NULL,
                "productBatchId" integer NOT NULL,
                "referenceId" integer NOT NULL,
                "type" smallint NOT NULL,
                "isRefund" smallint NOT NULL DEFAULT '0',
                "openQuantity" integer NOT NULL,
                "number" integer NOT NULL,
                "unit" character varying(255) NOT NULL DEFAULT '{"name":"","rate":1}',
                "closeQuantity" integer NOT NULL,
                "price" bigint NOT NULL DEFAULT '0',
                "totalMoney" bigint NOT NULL DEFAULT '0',
                "createTime" bigint NOT NULL,
                CONSTRAINT "PK_ed9aaf7e7fa157ec0b56d21a6e1" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_ProductMovement__oid_productBatchId_createTime" 
                ON "ProductMovement" ("oid", "productBatchId", "createTime")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_ProductMovement__oid_productId_createTime" 
                ON "ProductMovement" ("oid", "productId", "createTime")
        `)
    await queryRunner.query(`
            CREATE TABLE "User" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "phone" character(10),
                "username" character varying(255) NOT NULL,
                "password" character varying(255) NOT NULL,
                "secret" character varying(255),
                "role" smallint NOT NULL DEFAULT '2',
                "fullName" character varying(255),
                "birthday" bigint,
                "gender" smallint,
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_EMPLOYEE__OID_USERNAME" ON "User" ("oid", "username")
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_EMPLOYEE__OID_USERNAME"
        `)
    await queryRunner.query(`
            DROP TABLE "User"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ProductMovement__oid_productId_createTime"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ProductMovement__oid_productBatchId_createTime"
        `)
    await queryRunner.query(`
            DROP TABLE "ProductMovement"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_OrganizationSetting__type"
        `)
    await queryRunner.query(`
            DROP TABLE "OrganizationSetting"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Organization__phone"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Organization__email"
        `)
    await queryRunner.query(`
            DROP TABLE "Organization"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_DistributorPayment__distributorId"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_DistributorPayment__receiptId"
        `)
    await queryRunner.query(`
            DROP TABLE "DistributorPayment"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Receipt__oid_distributorId"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Receipt__oid_time"
        `)
    await queryRunner.query(`
            DROP TABLE "Receipt"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ReceiptItem__oid_productBatchId"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ReceiptItem__oid_receiptId"
        `)
    await queryRunner.query(`
            DROP TABLE "ReceiptItem"
        `)
    await queryRunner.query(`
            DROP TABLE "Distributor"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_CustomerPayment__customerId"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_CustomerPayment__invoiceId"
        `)
    await queryRunner.query(`
            DROP TABLE "CustomerPayment"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Invoice__oid_customerId"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Invoice__oid_time"
        `)
    await queryRunner.query(`
            DROP TABLE "Invoice"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_InvoiceSurcharge__invoiceId"
        `)
    await queryRunner.query(`
            DROP TABLE "InvoiceSurcharge"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_InvoiceItem__invoiceId"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_InvoiceItem__customerId_type"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_InvoiceItem__referenceId"
        `)
    await queryRunner.query(`
            DROP TABLE "InvoiceItem"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ProductBatch__oid_productId"
        `)
    await queryRunner.query(`
            DROP TABLE "ProductBatch"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Product__oid_brandName"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Product__oid_substance"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Product__oid_group"
        `)
    await queryRunner.query(`
            DROP TABLE "Product"
        `)
    await queryRunner.query(`
            DROP TABLE "Procedure"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_InvoiceExpense__invoiceId"
        `)
    await queryRunner.query(`
            DROP TABLE "InvoiceExpense"
        `)
    await queryRunner.query(`
            DROP TABLE "Customer"
        `)
  }
}

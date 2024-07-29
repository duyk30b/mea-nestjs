/* eslint-disable max-len */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version501720076523845 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if ('Procedure') {
            await queryRunner.query(`
                ALTER TABLE "Procedure" DROP COLUMN "consumableHint"
            `)
        }

        if ('Batch') {
            await queryRunner.query(`
                ALTER TABLE "Batch"
                    ADD "wholesalePrice" bigint NOT NULL DEFAULT '0',
                    ADD "retailPrice" bigint NOT NULL DEFAULT '0'
            `)
            await queryRunner.query(`
                UPDATE  "Batch" "batch"
                SET     "wholesalePrice" = product."wholesalePrice",
                        "retailPrice" = product."retailPrice"
                FROM    "Product" "product"
                WHERE   "batch"."productId" = "product"."id"
            `)
            await queryRunner.query(`
                DELETE FROM "Batch" 
                WHERE quantity = 0
                    AND id NOT IN (
                        SELECT DISTINCT "batchId" FROM "ReceiptItem"
                        UNION
                        SELECT DISTINCT "batchId" FROM "InvoiceItem"
                        UNION
                        SELECT DISTINCT "batchId" FROM "BatchMovement"
                    )
            `)
        }

        if ('ReceiptItem') {
            await queryRunner.query(`
                ALTER TABLE "ReceiptItem"
                    ADD "wholesalePrice" bigint NOT NULL DEFAULT '0',
                    ADD "retailPrice" bigint NOT NULL DEFAULT '0'
            `)
            await queryRunner.query(`
                UPDATE  "ReceiptItem" "ri"
                SET     "wholesalePrice" = product."wholesalePrice",
                        "retailPrice" = product."retailPrice"
                FROM    "Product" "product"
                WHERE   "ri"."productId" = "product"."id"
            `)
        }

        if ('Setting') {
            await queryRunner.query(`
                DROP INDEX "public"."IDX_OrganizationSetting__type";
            `)
            await queryRunner.query(`
                ALTER TABLE "OrganizationSetting" RENAME TO "Setting";
                ALTER SEQUENCE "OrganizationSetting_id_seq" RENAME TO "Setting_id_seq"
            `)
            await queryRunner.query(`
                ALTER TABLE "Setting" RENAME COLUMN "type" TO "key";
            `)
            await queryRunner.query(`
                CREATE UNIQUE INDEX "IDX_Setting__oid_key" ON "Setting" ("oid", "key")
            `)
        }

        if ('Remove oid = 0 & uid = 0') {
            await queryRunner.query(`
                UPDATE  "Organization" "org"
                SET     "id" = 4
                WHERE   "org"."id" = 1
            `)
            await queryRunner.query(`
                UPDATE  "Organization" "org"
                SET     "id" = 1
                WHERE   "org"."id" = 0
            `)
            await queryRunner.query(`
                UPDATE  "User" "u"
                SET     "id" = 4, "oid" = 4
                WHERE   "u"."id" = 1
            `)
            await queryRunner.query(`
                UPDATE  "User" "u"
                SET     "id" = 1, "oid" = 1
                WHERE   "u"."id" = 0
            `)
        }

        if ('CREATE TicketProduct & TicketProcedure') {
            await queryRunner.query(`
                DROP INDEX "public"."IDX_InvoiceItem__invoiceId";
                DROP INDEX "public"."IDX_InvoiceItem__customerId_type";
                DROP INDEX "public"."IDX_InvoiceItem__oid_productId";
                DROP INDEX "public"."IDX_InvoiceItem__oid_batchId";
                DROP INDEX "public"."IDX_InvoiceItem__oid_procedureId";
            `)
            await queryRunner.query(`
                ALTER TABLE "InvoiceItem" RENAME TO "TicketProduct";
                ALTER SEQUENCE "InvoiceItem_id_seq" RENAME TO "TicketProduct_id_seq"
            `)

            await queryRunner.query(`
                CREATE TABLE "TicketProcedure" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "invoiceId" integer NOT NULL,
                    "customerId" integer NOT NULL,
                    "productId" integer NOT NULL DEFAULT '0',
                    "batchId" integer NOT NULL DEFAULT '0',
                    "procedureId" integer NOT NULL DEFAULT '0',
                    "type" smallint NOT NULL,
                    "quantity" numeric(10, 3) NOT NULL DEFAULT '0',
                    "unitRate" smallint NOT NULL DEFAULT '1',
                    "costAmount" bigint NOT NULL DEFAULT '0',
                    "expectedPrice" bigint,
                    "discountMoney" bigint NOT NULL DEFAULT '0',
                    "discountPercent" smallint NOT NULL DEFAULT '0',
                    "discountType" character varying(255) NOT NULL DEFAULT 'VNĐ',
                    "actualPrice" bigint NOT NULL,
                    "hintUsage" character varying(255),
                    CONSTRAINT "PK_28c40343d4615cf570084ca67a4" PRIMARY KEY ("id")
                )
            `)
            await queryRunner.query(`
                INSERT INTO "TicketProcedure" (oid, "invoiceId", "customerId","productId",
                    "batchId", "procedureId", "type",
                    "quantity", "unitRate", "costAmount", "expectedPrice", "discountMoney",
                    "discountPercent", "discountType", "actualPrice", "hintUsage")
                SELECT oid, "invoiceId", "customerId","productId", 
                    "batchId", "procedureId", "type",
                    "quantity", "unitRate", "costAmount", "expectedPrice", "discountMoney",
                    "discountPercent", "discountType", "actualPrice", "hintUsage"
                FROM "TicketProduct";
            `)
            await queryRunner.query(`
                  DELETE FROM "TicketProduct" WHERE "productId" = 0;
                  DELETE FROM "TicketProcedure" WHERE "procedureId" = 0;
              `)
        }

        if ('TicketProduct') {
            await queryRunner.query(`
                ALTER TABLE "TicketProduct" DROP COLUMN "procedureId";
                ALTER TABLE "TicketProduct" DROP COLUMN "type";
                ALTER TABLE "TicketProduct" ALTER COLUMN "productId" DROP DEFAULT;
                ALTER TABLE "TicketProduct" RENAME COLUMN "invoiceId" TO "ticketId";
                ALTER TABLE "TicketProduct" RENAME COLUMN "discountPercent" TO "discountPercent_temp";
                ALTER TABLE "TicketProduct" RENAME COLUMN "discountType" TO "discountType_temp";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProduct"
                    ADD "deliveryStatus" smallint NOT NULL DEFAULT '2',
                    ADD "quantityPrescription" integer NOT NULL DEFAULT '0',
                    ADD "quantityReturn" numeric(10, 3) NOT NULL DEFAULT '0',
                    ADD "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                    ADD "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0'
            `)
            await queryRunner.query(`
                UPDATE  "TicketProduct" "tk"
                SET     "discountPercent" = "discountPercent_temp",
                        "discountType" = "discountType_temp"
            `)
            await queryRunner.query(`
                ALTER TABLE "TicketProduct" 
                    DROP COLUMN "discountPercent_temp",
                    DROP COLUMN "discountType_temp"
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_TicketProduct__oid_ticketId" ON "TicketProduct" ("oid", "ticketId")
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_TicketProduct__oid_customerId" 
                    ON "TicketProduct" ("oid", "customerId")
            `)
        }

        if ('TicketProcedure') {
            await queryRunner.query(`
                ALTER TABLE "TicketProcedure" DROP COLUMN "productId";
                ALTER TABLE "TicketProcedure" DROP COLUMN "batchId";
                ALTER TABLE "TicketProcedure" DROP COLUMN "type";
                ALTER TABLE "TicketProcedure" DROP COLUMN "unitRate";
                ALTER TABLE "TicketProcedure" DROP COLUMN "costAmount";
                ALTER TABLE "TicketProcedure" DROP COLUMN "hintUsage";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProcedure" RENAME COLUMN "invoiceId" TO "ticketId";
                ALTER TABLE "TicketProcedure" RENAME COLUMN "quantity" TO "quantity_temp";
                ALTER TABLE "TicketProcedure" RENAME COLUMN "discountPercent" TO "discountPercent_temp";
                ALTER TABLE "TicketProcedure" RENAME COLUMN "discountType" TO "discountType_temp";
            `)
            await queryRunner.query(`
                ALTER TABLE "TicketProcedure"
                    ADD "createdAt" bigint,
                    ADD "quantity" integer NOT NULL DEFAULT '0',
                    ADD "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                    ADD "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ'
            `)
            await queryRunner.query(`
                UPDATE  "TicketProcedure" "tk"
                SET     "quantity" = "quantity_temp",
                        "discountPercent" = "discountPercent_temp",
                        "discountType" = "discountType_temp"
            `)
            await queryRunner.query(`
                ALTER TABLE "TicketProcedure" 
                    DROP COLUMN "quantity_temp",
                    DROP COLUMN "discountPercent_temp",
                    DROP COLUMN "discountType_temp"
                `)

            await queryRunner.query(`
                CREATE INDEX "IDX_TicketProcedure__oid_procedureId" 
                    ON "TicketProcedure" ("oid", "procedureId")
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_TicketProcedure__oid_ticketId" 
                    ON "TicketProcedure" ("oid", "ticketId")
            `)
        }

        if ('Ticket') {
            await queryRunner.query(`
                DROP INDEX "public"."IDX_Invoice__oid_customerId";
                DROP INDEX "public"."IDX_Invoice__oid_startedAt";
            `)
            await queryRunner.query(`
                ALTER TABLE "Invoice" RENAME TO "Ticket";
                ALTER SEQUENCE "Invoice_id_seq" RENAME TO "Ticket_id_seq"
            `)

            await queryRunner.query(`
                ALTER TABLE "Ticket" ALTER COLUMN "totalCostAmount" SET DEFAULT '0';
                ALTER TABLE "Ticket" ALTER COLUMN "totalMoney" SET DEFAULT '0';
                ALTER TABLE "Ticket" ALTER COLUMN "profit" SET DEFAULT '0';
                ALTER TABLE "Ticket" RENAME COLUMN "discountPercent" TO "discountPercent_temp";
                ALTER TABLE "Ticket" RENAME COLUMN "discountType" TO "discountType_temp";
            `)

            await queryRunner.query(`
                ALTER TABLE "Ticket"
                    ADD "voucherType" smallint NOT NULL DEFAULT '2',
                    ADD "ticketStatus" smallint NOT NULL DEFAULT '2',
                    ADD "deliveryStatus" smallint NOT NULL DEFAULT '1',
                    ADD "proceduresMoney" bigint NOT NULL DEFAULT '0',
                    ADD "productsMoney" bigint NOT NULL DEFAULT '0',
                    ADD "radiologyMoney" bigint NOT NULL DEFAULT '0',
                    ADD "registeredAt" bigint,
                    ADD "updatedAt" bigint NOT NULL DEFAULT (
                        EXTRACT(
                            epoch
                            FROM now()
                        ) * (1000)
                    ),
                    ADD "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                    ADD "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                    ADD "visitId" integer NOT NULL DEFAULT '0'
            `)

            await queryRunner.query(`
                UPDATE  "Ticket" "tk"
                SET     "productsMoney" = "temp"."sumMoney"
                FROM    ( 
                SELECT "ticketId", SUM("quantity" * "actualPrice") as "sumMoney" 
                    FROM "TicketProduct"
                    GROUP BY "ticketId" 
                ) AS "temp" 
                WHERE "tk"."id" = "temp"."ticketId"
            `)
            await queryRunner.query(`
                UPDATE  "Ticket" "tk"
                SET     "proceduresMoney" = "temp"."sumMoney"
                FROM    ( 
                SELECT "ticketId", SUM("quantity" * "actualPrice") as "sumMoney" 
                    FROM "TicketProcedure"
                    GROUP BY "ticketId" 
                ) AS "temp" 
                WHERE "tk"."id" = "temp"."ticketId"
            `)

            // update status sau khi update tiền
            await queryRunner.query(`
                UPDATE  "Ticket" "tk"
                SET     "voucherType" = 2,
                        "registeredAt" = "startedAt",
                        "discountPercent" = "discountPercent_temp",
                        "discountType" = "discountType_temp",
                        "ticketStatus" = CASE 
                            WHEN("status" = -1) THEN 7
                            WHEN("status" = 0) THEN 2
                            WHEN("status" = 1) THEN 3
                            WHEN("status" = 2) THEN 5
                            WHEN("status" = 3) THEN 6
                            ELSE 0
                        END,
                        "deliveryStatus" = CASE 
                            WHEN("productsMoney" = 0) THEN 1
                            WHEN("status" = -1) THEN 4
                            WHEN("status" = 0) THEN 2
                            WHEN("status" = 1) THEN 2
                            WHEN("status" = 2) THEN 3
                            WHEN("status" = 3) THEN 3
                            ELSE 0
                        END
            `)

            // lưu ý thằng deleteAt => deleted chỉ có thể là refund => cancel
            await queryRunner.query(`
                ALTER TABLE "Ticket" 
                    DROP COLUMN "deletedAt",
                    DROP COLUMN "status",
                    DROP COLUMN "itemsActualMoney",
                    DROP COLUMN "discountPercent_temp",
                    DROP COLUMN "discountType_temp";
                `)
            await queryRunner.query(`
                CREATE INDEX "IDX_Ticket__oid_registeredAt" ON "Ticket" ("oid", "registeredAt")
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_Ticket__oid_customerId" ON "Ticket" ("oid", "customerId")
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_Ticket__oid_ticketStatus" ON "Ticket" ("oid", "ticketStatus")
            `)
        }

        if ('TicketSurcharge') {
            await queryRunner.query(`
                DROP INDEX "public"."IDX_InvoiceSurcharge__invoiceId";
            `)
            await queryRunner.query(`
                ALTER TABLE "InvoiceSurcharge" RENAME TO "TicketSurcharge";
                ALTER SEQUENCE "InvoiceSurcharge_id_seq" RENAME TO "TicketSurcharge_id_seq"
            `)
            await queryRunner.query(`
                ALTER TABLE "TicketSurcharge"
                    RENAME COLUMN "invoiceId" TO "ticketId"
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_TicketSurcharge__ticketId" ON "TicketSurcharge" ("oid", "ticketId")
            `)
        }

        if ('TicketExpense') {
            await queryRunner.query(`
                DROP INDEX "public"."IDX_InvoiceExpense__invoiceId";
            `)
            await queryRunner.query(`
                ALTER TABLE "InvoiceExpense" RENAME TO "TicketExpense";
                ALTER SEQUENCE "InvoiceExpense_id_seq" RENAME TO "TicketExpense_id_seq"
            `)
            await queryRunner.query(`
                ALTER TABLE "TicketExpense"
                    RENAME COLUMN "invoiceId" TO "ticketId"
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_TicketExpense__ticketId" ON "TicketExpense" ("oid", "ticketId")
            `)
        }

        if ('TicketDiagnosis') {
            await queryRunner.query(`
                CREATE TABLE "TicketDiagnosis" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "ticketId" integer NOT NULL,
                    "reason" character varying NOT NULL DEFAULT '',
                    "healthHistory" text NOT NULL DEFAULT '',
                    "summary" text NOT NULL DEFAULT '',
                    "diagnosis" character varying NOT NULL DEFAULT '',
                    "vitalSigns" text NOT NULL DEFAULT '{}',
                    "imageIds" character varying(100) NOT NULL DEFAULT '[]',
                    "advice" text NOT NULL DEFAULT '',
                    CONSTRAINT "PK_ced4dd5b732bb39a400ad2e15b6" PRIMARY KEY ("id")
                )
            `)
            await queryRunner.query(`
                CREATE INDEX "IDX_TicketDiagnosis__oid_ticketId" ON "TicketDiagnosis" ("oid", "ticketId")
            `)
        }

        if ('Radiology') {
            await queryRunner.query(`
                CREATE TABLE "Radiology" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "name" character varying(255) NOT NULL,
                    "group" character varying(25) NOT NULL,
                    "price" integer,
                    "descriptionDefault" text NOT NULL DEFAULT '',
                    "resultDefault" text NOT NULL DEFAULT '',
                    "updatedAt" bigint NOT NULL DEFAULT (
                        EXTRACT(
                            epoch
                            FROM now()
                        ) * (1000)
                    ),
                    "deletedAt" bigint,
                    CONSTRAINT "PK_73221f9dce01012a68295e2ffce" PRIMARY KEY ("id")
                )
            `)
        }

        if ('TicketRadiology') {
            await queryRunner.query(`
                CREATE TABLE "TicketRadiology" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "ticketId" integer NOT NULL,
                    "customerId" integer NOT NULL,
                    "radiologyId" integer NOT NULL,
                    "doctorId" integer NOT NULL DEFAULT '0',
                    "expectedPrice" bigint NOT NULL DEFAULT '0',
                    "discountMoney" bigint NOT NULL DEFAULT '0',
                    "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                    "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                    "actualPrice" bigint NOT NULL DEFAULT '0',
                    "startedAt" bigint,
                    "description" text NOT NULL DEFAULT '',
                    "result" text NOT NULL DEFAULT '',
                    "imageIds" character varying(100) NOT NULL DEFAULT '[]',
                    CONSTRAINT "PK_43b4dfbda258fb0db966494989b" PRIMARY KEY ("id")
                )
            `)
            await queryRunner.query(`
            CREATE INDEX "IDX_TicketRadiology__oid_radiologyId" 
                ON "TicketRadiology" ("oid", "radiologyId")
        `)
            await queryRunner.query(`
            CREATE INDEX "IDX_TicketRadiology__oid_ticketId" 
                ON "TicketRadiology" ("oid", "ticketId")
        `)
        }

        if ('Image') {
            await queryRunner.query(`
                CREATE TABLE "Image" (
                    "oid" integer NOT NULL,
                    "id" SERIAL NOT NULL,
                    "name" character varying(50) NOT NULL,
                    "mimeType" character varying(100) NOT NULL,
                    "size" integer NOT NULL,
                    "hostType" character varying(50) NOT NULL DEFAULT 'GoogleDriver',
                    "hostAccount" character varying(50) NOT NULL,
                    "hostId" character varying(50) NOT NULL,
                    "waitDelete" smallint NOT NULL DEFAULT '0',
                    CONSTRAINT "PK_ddecd6b02f6dd0d3d10a0a74717" PRIMARY KEY ("id")
                )
            `)
        }

        if ('old table VISIT') {
            await queryRunner.query(`
                ALTER TABLE "Visit"
                    ADD "voucherType" smallint NOT NULL DEFAULT '3',
                    ADD "ticketStatus" smallint NOT NULL DEFAULT '2',
                    ADD "deliveryStatus" smallint NOT NULL DEFAULT '1',
                    ADD "radiologyMoney" bigint NOT NULL DEFAULT '0',
                    ADD "surcharge" bigint NOT NULL DEFAULT '0',
                    ADD "expense" bigint NOT NULL DEFAULT '0',
                    ADD "note" character varying(255) DEFAULT ''
            `)

            await queryRunner.query(`
                UPDATE  "Visit" "vs"
                SET     "voucherType" = 3,
                        "ticketStatus" = CASE 
                            WHEN("visitStatus" = 1) THEN 1
                            WHEN("visitStatus" = 2) THEN 2
                            WHEN("visitStatus" = 3) THEN 4
                            WHEN("visitStatus" = 4) THEN 5
                            WHEN("visitStatus" = 5) THEN 6
                            ELSE 0
                        END,
                        "deliveryStatus" = CASE 
                            WHEN("isSent" = 1) THEN 3
                            WHEN("isSent" = 0 AND "productsMoney" = 0) THEN 1
                            ELSE 2
                        END
            `)

            await queryRunner.query(`
                INSERT INTO "Ticket" (oid, "customerId", "totalCostAmount", "discountMoney",
                    "surcharge", "totalMoney", "expense", "profit", "debt", "note",
                    "startedAt", "paid", "year", "month", "date",
                    "endedAt", "voucherType", "ticketStatus", "deliveryStatus",
                    "proceduresMoney", "productsMoney", "radiologyMoney",
                    "registeredAt", "updatedAt", "discountPercent", "discountType",
                    "visitId"
                    )
                SELECT oid, "customerId", "totalCostAmount",  "discountMoney",
                    "surcharge", "totalMoney", "expense", "profit", "debt", "note",
                    "startedAt", "paid", "year", "month", "date",
                    "endedAt", "voucherType", "ticketStatus", "deliveryStatus",
                    "proceduresMoney", "productsMoney", "radiologyMoney",
                    "registeredAt", "updatedAt", "discountPercent", "discountType",
                    "id"
                FROM "Visit";
            `)

            // VisitDiagnosis
            await queryRunner.query(`
                ALTER TABLE "VisitDiagnosis"
                    ADD "ticketId" integer NOT NULL DEFAULT '0',
                    ADD "imageIds" character varying(100) NOT NULL DEFAULT '[]'
            `)
            await queryRunner.query(`
                UPDATE  "VisitDiagnosis" "vd"
                SET     "ticketId" = ticket."id"
                FROM    "Ticket" "ticket"
                WHERE   "vd"."visitId" = "ticket"."visitId"
            `)
            await queryRunner.query(`
                INSERT INTO "TicketDiagnosis" (oid, "ticketId", "reason", "healthHistory",
                    "summary", "diagnosis", "vitalSigns", "imageIds", "advice"
                    )
                SELECT oid, "ticketId", "reason", "healthHistory",
                    "summary", "diagnosis", "vitalSigns", "imageIds", "advice"
                FROM "VisitDiagnosis";
            `)

            // VisitProcedure
            await queryRunner.query(`
                ALTER TABLE "VisitProcedure"
                    ADD "ticketId" integer NOT NULL DEFAULT '0'
            `)
            await queryRunner.query(`
                UPDATE  "VisitProcedure" "vd"
                SET     "ticketId" = ticket."id"
                FROM    "Ticket" "ticket"
                WHERE   "vd"."visitId" = "ticket"."visitId"
            `)
            await queryRunner.query(`
                INSERT INTO "TicketProcedure" (oid, "ticketId", "customerId", "procedureId",
                    "expectedPrice", "discountMoney", "actualPrice", "createdAt", 
                    "quantity", "discountPercent", "discountType"
                    )
                SELECT oid, "ticketId", "customerId", "procedureId",
                    "expectedPrice", "discountMoney", "actualPrice", "createdAt", 
                    "quantity", "discountPercent", "discountType"
                FROM "VisitProcedure";
            `)

            // VisitProduct
            await queryRunner.query(`
                ALTER TABLE "VisitProduct"
                    ADD "ticketId" integer NOT NULL DEFAULT '0',
                    ADD "customerId" integer NOT NULL DEFAULT '0',
                    ADD "batchId" integer NOT NULL DEFAULT '0',
                    ADD "deliveryStatus" smallint NOT NULL DEFAULT '2',
                    ADD "quantityReturn" numeric(10, 3) NOT NULL DEFAULT '0'
            `)
            await queryRunner.query(`
                UPDATE  "VisitProduct" "vp"
                SET     "ticketId"          = ticket."id",
                        "customerId"        = ticket."customerId",
                        "deliveryStatus"    = CASE 
                                                WHEN("isSent" = 1) THEN 3
                                                ELSE 2
                                            END
                FROM    "Ticket" "ticket"
                WHERE   "vp"."visitId" = "ticket"."visitId"
            `)
            await queryRunner.query(`
                UPDATE  "VisitProduct" "vp"
                SET     "batchId"          = vb."batchId"
                FROM    "VisitBatch" "vb"
                WHERE   "vp"."id" = "vb"."visitProductId"
            `)
            await queryRunner.query(`
                INSERT INTO "TicketProduct" (oid, "ticketId", "customerId", "expectedPrice",
                    "actualPrice", "hintUsage", "productId", "batchId", 
                    "costAmount", "quantity", "unitRate", "deliveryStatus",
                    "quantityPrescription", "quantityReturn", "discountType", "discountPercent"
                    )
                SELECT oid, "ticketId", "customerId", "expectedPrice",
                    "actualPrice", "hintUsage", "productId", "batchId", 
                    "costAmount", "quantity", "unitRate", "deliveryStatus",
                    "quantityPrescription", "quantityReturn", "discountType", "discountPercent"
                FROM "VisitProduct";
            `)

            await queryRunner.query(`
                DROP TABLE "Visit" CASCADE;
                DROP TABLE "VisitDiagnosis" CASCADE;
                DROP TABLE "VisitProcedure" CASCADE;
                DROP TABLE "VisitProduct" CASCADE;
                DROP TABLE "VisitBatch" CASCADE;
            `)

            await queryRunner.query(`
                UPDATE  "CustomerPayment" "c"
                SET     "voucherId"         = ticket."id"
                FROM    "Ticket" "ticket"
                WHERE   "c"."voucherId"     = "ticket"."visitId"
                    AND "c"."voucherType"   = 3
            `)
            await queryRunner.query(`
                UPDATE  "ProductMovement" "c"
                SET     "voucherId"         = ticket."id"
                FROM    "Ticket" "ticket"
                WHERE   "c"."voucherId"     = "ticket"."visitId"
                    AND "c"."voucherType"   = 3
            `)

            await queryRunner.query(`
                ALTER TABLE "CustomerPayment" DROP COLUMN "voucherType"
            `)
            await queryRunner.query(`
                ALTER TABLE "CustomerPayment" RENAME COLUMN "voucherId" TO "ticketId";
            `)
            await queryRunner.query(`
                ALTER TABLE "Ticket" DROP COLUMN "visitId"
            `)
            // còn productmovement, paymenthistory
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

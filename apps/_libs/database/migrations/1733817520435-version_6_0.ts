/* eslint-disable max-len */
import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version601733817520435 implements MigrationInterface {
    name = 'Version601733817520435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Batch" 
                DROP COLUMN "retailPrice",
                DROP COLUMN "wholesalePrice";

            INSERT INTO "Batch" (oid, "productId", "lotNumber", "expiryDate", 
                                "costPrice", "quantity")
            SELECT  "Product".oid, 
                    "Product"."id", 
                    "Product"."lotNumber", 
                    "Product"."expiryDate", 
                    "Product"."costPrice",
                    "Product"."quantity"
            FROM "Product" 
            WHERE NOT EXISTS (
                SELECT 1 FROM "Batch" 
                WHERE "Batch"."productId" = "Product"."id" AND "Product"."hasManageQuantity" = 1
            );

            ALTER TABLE "Batch"
                ADD "distributorId" integer NOT NULL DEFAULT '0',
                ADD "warehouseId" integer NOT NULL DEFAULT '0';

            UPDATE "ReceiptItem"
                SET "batchId" = "Batch"."id"
                FROM "Batch"
                WHERE "Batch"."productId" = "ReceiptItem"."productId" 
                    AND "ReceiptItem"."batchId" = 0;

            UPDATE "Batch"
                SET "distributorId" = "ReceiptItem"."distributorId"
                FROM "ReceiptItem"
                WHERE "Batch"."id" = "ReceiptItem"."batchId" AND "ReceiptItem"."batchId" != 0;

            DELETE FROM "Batch"
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM "Product"
                    WHERE "Product"."id" = "Batch"."productId"
                );
        `)

        await queryRunner.query(`
            ALTER TABLE "Product" 
                DROP COLUMN "deletedAt",
                DROP COLUMN "costAmount",
                DROP COLUMN "lotNumber",
                DROP COLUMN "hasManageBatches",
                DROP COLUMN "expiryDate";

            ALTER TABLE "Product"
                ADD "warehouseIds" character varying(100) NOT NULL DEFAULT '[0]';
        `)

        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
                ADD "warehouseId" integer NOT NULL DEFAULT '0';

            ALTER TABLE "ReceiptItem"
                DROP COLUMN "retailPrice",
                DROP COLUMN "wholesalePrice";
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketProduct"
                ADD "warehouseId" integer NOT NULL DEFAULT '0',
                ADD "costPrice" bigint NOT NULL DEFAULT '0';

            ALTER TABLE "TicketProduct"
                DROP COLUMN "costAmount",
                DROP COLUMN "quantityReturn";

            ALTER TABLE "TicketProduct" ALTER COLUMN "expectedPrice" SET NOT NULL;
            ALTER TABLE "TicketProduct" ALTER COLUMN "expectedPrice" SET DEFAULT '0';

            UPDATE "TicketProduct"
                SET "batchId" = "Batch"."id"
                FROM "Batch"
                WHERE "Batch"."productId" = "TicketProduct"."productId" 
                    AND "TicketProduct"."batchId" = 0;

            UPDATE "TicketProduct"
                SET "costPrice" = "Batch"."costPrice"
                FROM "Batch"
                WHERE "Batch"."id" = "TicketProduct"."batchId"
        `)

        await queryRunner.query(`
            DROP INDEX "public"."IDX_ProductMovement__oid_contactId_voucherType_id";

            ALTER TABLE "ProductMovement" 
                DROP COLUMN "closeCostAmount",
                DROP COLUMN "openCostAmount",
                DROP COLUMN "costAmount";

            ALTER TABLE "ProductMovement"
                ADD "warehouseId" integer NOT NULL DEFAULT '0',
                ADD "costPrice" bigint NOT NULL DEFAULT '0';

            ALTER TABLE "ProductMovement"
                RENAME COLUMN "voucherType" TO "movementType";

            CREATE INDEX "IDX_ProductMovement__oid_contactId_movementType_id" 
                ON "ProductMovement" ("oid", "contactId", "movementType", "id");

            UPDATE "ProductMovement"
                SET "costPrice" = "TicketProduct"."costPrice"
                FROM "TicketProduct"
                WHERE "TicketProduct"."productId" = "ProductMovement"."productId" 
        `)

        await queryRunner.query(`
            ALTER TABLE "BatchMovement"
                ADD "warehouseId" integer NOT NULL DEFAULT '0';
                
            ALTER TABLE "BatchMovement"
                RENAME COLUMN "voucherType" TO "movementType"
        `)

        await queryRunner.query(`
            WITH TicketProductAggregates AS (
                SELECT
                    "TicketProduct"."ticketId",
                    COALESCE(SUM("TicketProduct"."quantity" * "TicketProduct"."costPrice"), 0) AS "totalCostAmount",
                    COALESCE(SUM("TicketProduct"."quantity" * "TicketProduct"."discountMoney"), 0) AS "productDiscount",
                    COALESCE(SUM("TicketProduct"."quantity" * "TicketProduct"."actualPrice"), 0) AS "productMoney"
                FROM
                    "TicketProduct"
                GROUP BY
                    "TicketProduct"."ticketId"
            ),
            TicketProcedureAggregates AS (
                SELECT
                    "TicketProcedure"."ticketId",
                    COALESCE(SUM("TicketProcedure"."quantity" * "TicketProcedure"."discountMoney"), 0) AS "procedureDiscount",
                    COALESCE(SUM("TicketProcedure"."quantity" * "TicketProcedure"."actualPrice"), 0) AS "procedureMoney"
                FROM
                    "TicketProcedure"
                GROUP BY
                    "TicketProcedure"."ticketId"
            ),
            TicketLaboratoryAggregates AS (
                SELECT
                    "TicketLaboratory"."ticketId",
                    COALESCE(SUM("TicketLaboratory"."discountMoney"), 0) AS "laboratoryDiscount",
                    COALESCE(SUM("TicketLaboratory"."actualPrice"), 0) AS "laboratoryMoney"
                FROM
                    "TicketLaboratory"
                GROUP BY
                    "TicketLaboratory"."ticketId"
            ),
            TicketRadiologyAggregates AS (
                SELECT
                    "TicketRadiology"."ticketId",
                    COALESCE(SUM("TicketRadiology"."discountMoney"), 0) AS "radiologyDiscount",
                    COALESCE(SUM("TicketRadiology"."actualPrice"), 0) AS "radiologyMoney"
                FROM
                    "TicketRadiology"
                GROUP BY
                    "TicketRadiology"."ticketId"
            ),
            TicketAggregates AS (
                SELECT
                    "Ticket"."id",
                    COALESCE(tp."totalCostAmount", 0) AS "totalCostAmount",
                    COALESCE(tp."productDiscount", 0) +
                    COALESCE(tpr."procedureDiscount", 0) +
                    COALESCE(tl."laboratoryDiscount", 0) +
                    COALESCE(tr."radiologyDiscount", 0) AS "itemsDiscount",
                    COALESCE(tp."productMoney", 0) AS "productMoney",
                    COALESCE(tpr."procedureMoney", 0) AS "procedureMoney",
                    COALESCE(tr."radiologyMoney", 0) AS "radiologyMoney",
                    COALESCE(tl."laboratoryMoney", 0) AS "laboratoryMoney"
                FROM
                    "Ticket"
                    LEFT JOIN TicketProductAggregates tp ON "Ticket"."id" = tp."ticketId"
                    LEFT JOIN TicketProcedureAggregates tpr ON "Ticket"."id" = tpr."ticketId"
                    LEFT JOIN TicketLaboratoryAggregates tl ON "Ticket"."id" = tl."ticketId"
                    LEFT JOIN TicketRadiologyAggregates tr ON "Ticket"."id" = tr."ticketId"
            )
            UPDATE "Ticket"
            SET
                "totalCostAmount" = agg."totalCostAmount",
                "itemsDiscount" = agg."itemsDiscount",
                "productMoney" = agg."productMoney",
                "procedureMoney" = agg."procedureMoney",
                "radiologyMoney" = agg."radiologyMoney",
                "laboratoryMoney" = agg."laboratoryMoney",
                "itemsActualMoney" = agg."productMoney" + agg."procedureMoney" + agg."radiologyMoney" + agg."laboratoryMoney",
                "profit" = "totalMoney" - "expense" - agg."totalCostAmount"
            FROM
                TicketAggregates agg
            WHERE
                "Ticket"."id" = agg."id";
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

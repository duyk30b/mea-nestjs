import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version801745859665905 implements MigrationInterface {
    name = 'Version801745859665905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_Batch__oid_updatedAt";
            ALTER TABLE "Batch"
                ADD "registeredAt" bigint NOT NULL DEFAULT '0';
            CREATE INDEX "IDX_Batch__oid_registeredAt" ON "Batch" ("oid", "registeredAt")
        `)

        await queryRunner.query(`
            CREATE TABLE "TicketBatch" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "customerId" integer NOT NULL,
                "ticketId" integer NOT NULL,
                "ticketProductId" integer NOT NULL,
                "warehouseId" integer NOT NULL,
                "productId" integer NOT NULL,
                "batchId" integer NOT NULL DEFAULT '0',
                "deliveryStatus" smallint NOT NULL DEFAULT '2',
                "unitRate" smallint NOT NULL DEFAULT '1',
                "quantity" numeric(10, 3) NOT NULL DEFAULT '0',
                "costPrice" bigint NOT NULL DEFAULT '0',
                "expectedPrice" bigint NOT NULL,
                "actualPrice" bigint NOT NULL,
                CONSTRAINT "PK_6e6a7947aa229a246d477c4a375" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketBatch__oid_customerId" ON "TicketBatch" ("oid", "customerId");
            CREATE INDEX "IDX_TicketBatch__oid_ticketId" ON "TicketBatch" ("oid", "ticketId");
        `)

        await queryRunner.query(`
            INSERT INTO "TicketBatch" (oid, "customerId", "ticketId", "ticketProductId",
                "warehouseId", "productId", "batchId", "deliveryStatus", "unitRate",
                "quantity", "costPrice", "expectedPrice","actualPrice"
                )
            SELECT oid, "customerId", "ticketId", id, 
                "warehouseId", "productId", "batchId", "deliveryStatus", "unitRate",
                "quantity", "costPrice", "expectedPrice", "actualPrice"
            FROM "TicketProduct";
        `)

        await queryRunner.query(`
            ALTER TABLE "ProductMovement"
                ADD "voucherProductId" integer NOT NULL DEFAULT '0',
                ADD "batchId" integer NOT NULL DEFAULT '0';

            UPDATE  "ProductMovement" "pm"
            SET     "voucherProductId"  = "tp"."id",
                    "batchId" = "tp"."batchId"
            FROM    "TicketProduct" "tp"
            WHERE   "tp"."ticketId"     = "pm"."voucherId" 
                AND "tp"."productId"    = "pm"."productId" 
                AND "pm"."movementType" = 2;

            UPDATE  "ProductMovement" "pm"
            SET     "voucherProductId"  = "ri"."id",
                    "batchId" = "ri"."batchId"
            FROM    "ReceiptItem" "ri"
            WHERE   "ri"."receiptId"    = "pm"."voucherId" 
                AND "ri"."productId"    = "pm"."productId" 
                AND "pm"."movementType" = 1;
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketProduct"
                ADD "costAmount" bigint NOT NULL DEFAULT '0',
                ADD "hasInventoryImpact" smallint NOT NULL DEFAULT '1';

            UPDATE  "TicketProduct"
            SET     "costAmount" = "quantity" * "costPrice";

            ALTER TABLE "TicketProduct" 
                DROP COLUMN "batchId",
                DROP COLUMN "costPrice";
        `)

        await queryRunner.query(`
            DROP TABLE "BatchMovement" CASCADE;
        `)

        // await queryRunner.query(`
        //     CREATE TABLE "ProductWarehouse" (
        //         "oid" integer NOT NULL,
        //         "id" SERIAL NOT NULL,
        //         "productId" integer NOT NULL DEFAULT '0',
        //         "warehouseId" integer NOT NULL DEFAULT '0',
        //         "quantity" numeric(10, 3) NOT NULL DEFAULT '0',
        //         "updatedAt" bigint NOT NULL DEFAULT (
        //             EXTRACT(
        //                 epoch
        //                 FROM now()
        //             ) * (1000)
        //         ),
        //         CONSTRAINT "PK_47f29f8cff90d7f1b57d31b3153" PRIMARY KEY ("id")
        //     );
        //     CREATE INDEX "IDX_ProductWarehouse__oid_warehouseId" ON "ProductWarehouse" ("oid", "warehouseId");
        //     CREATE INDEX "IDX_ProductWarehouse__oid_productId" ON "ProductWarehouse" ("oid", "productId");

        //     INSERT INTO "ProductWarehouse" ("oid", "productId", "quantity")
        //     SELECT "oid", "id", "quantity" FROM "Product";

        //     UPDATE "ProductWarehouse" pw
        //     SET "warehouseId" = CAST(REPLACE(REPLACE(p."warehouseIds", '[', ''), ']', '') AS INTEGER)
        //     FROM "Product" p
        //     WHERE p."id" = pw."productId";
        // `)

        // await queryRunner.query(`
        //     ALTER TABLE "Product" 
        //         DROP COLUMN "warehouseIds",
        //         DROP COLUMN "quantity";
        // `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

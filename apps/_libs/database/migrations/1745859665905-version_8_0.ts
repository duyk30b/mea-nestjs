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

        await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "note" character varying(255) NOT NULL DEFAULT '';
        `)

        await queryRunner.query(`
            UPDATE "Ticket" t
            SET "note" = ta."value"
            FROM "TicketAttribute" ta
            WHERE ta."ticketId" = t."id"
            AND ta."key" = 'note';

            DELETE FROM "TicketAttribute"
            WHERE "key" = 'note';

            UPDATE "PrintHtml"
            SET content = REPLACE(content, 'DTimer', 'ESTimer')
            WHERE content LIKE '%DTimer%';

            UPDATE "PrintHtml"
            SET content = REPLACE(content, 'ticket.ticketAttributeMap?.diagnosis', 'ticket.note')
            WHERE content LIKE '%ticket.ticketAttributeMap?.diagnosis%';
        `)

        await queryRunner.query(`
            ALTER TABLE "Product"
                ADD "code" integer NOT NULL DEFAULT '0';

            WITH ranked AS (
            SELECT
                id,
                oid,
                ROW_NUMBER() OVER (PARTITION BY oid ORDER BY id) AS new_code
            FROM "Product"
            )
            UPDATE "Product"
            SET code = ranked.new_code
            FROM ranked
            WHERE "Product".id = ranked.id;

            ALTER TABLE "Product"
                ADD CONSTRAINT "UNIQUE_Product__oid_code" UNIQUE ("oid", "code");
        `)

        await queryRunner.query(`
            CREATE INDEX "IDX_TicketBatch__oid_productId" ON "TicketBatch" ("oid", "productId")
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

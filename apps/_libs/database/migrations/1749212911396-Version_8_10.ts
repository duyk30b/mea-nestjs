import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version8101749212911396 implements MigrationInterface {
    name = 'Version8101749212911396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Product"
                RENAME COLUMN "inventoryStrategy" TO "pickupStrategy"
        `)
        await queryRunner.query(`
            ALTER TABLE "TicketProduct"
                RENAME COLUMN "inventoryStrategy" TO "pickupStrategy"
        `)

        await queryRunner.query(`
            DELETE FROM "Batch" WHERE "id" NOT IN ( 
                SELECT MAX("id") FROM "Batch"
                GROUP BY "productId"
            );
            UPDATE "Batch" SET id = -1 * id;
            UPDATE "Batch"
            SET     "id"            = "Product"."id",
                    "costPrice"     = "Product"."costPrice",
                    "quantity"      = "Product"."quantity",
                    "costAmount"    = "Product"."costPrice" * "Product"."quantity"
            FROM "Product"
            WHERE "Batch"."productId" = "Product"."id";
        `)

        await queryRunner.query(`
            UPDATE  "ReceiptItem"
            SET     "batchId" = CASE 
                                    WHEN("batchId" = 0) THEN 0
                                    ELSE "productId"
                                END
            ;

            UPDATE  "ProductMovement"
            SET     "batchId" = CASE 
                                    WHEN("batchId" = 0) THEN 0
                                    ELSE "productId"
                                END
            ;                      

            UPDATE  "TicketBatch"
            SET     "batchId" = CASE 
                                    WHEN("batchId" = 0) THEN 0
                                    ELSE "productId"
                                END
            ;

            UPDATE  "TicketProduct"
            SET     "batchId" = CASE 
                                    WHEN("batchId" = 0) THEN 0
                                    ELSE "productId"
                                END
            ;

            UPDATE  "StockCheckItem"
            SET     "batchId" = CASE 
                                    WHEN("batchId" = 0) THEN 0
                                    ELSE "productId"
                                END
            ;
        `)
        await queryRunner.query(`
            UPDATE      "Batch" 
            SET         "costPrice" = "ReceiptItem"."costPrice", 
                        "costAmount" = "ReceiptItem"."costPrice" * "Batch"."quantity" 
            FROM        "ReceiptItem" 
            WHERE       "Batch"."id" = "ReceiptItem"."batchId" 
            AND         "ReceiptItem"."batchId" != 0;

            DROP INDEX "public"."IDX_Batch__oid_registeredAt";
            CREATE INDEX "IDX_Batch__oid_updatedAt" ON "Batch" ("oid", "updatedAt");
        `)

        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
                ADD "listPrice" bigint NOT NULL DEFAULT '0'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

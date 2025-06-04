import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version881748948281704 implements MigrationInterface {
    name = 'Version881748948281704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE "PrintHtml" RENAME COLUMN "content" TO "html";
                ALTER TABLE "PrintHtml" ADD "css" text NOT NULL DEFAULT ''
            `)
        await queryRunner.query(`
                ALTER TABLE "Product"
                    ADD "splitBatchByWarehouse" smallint NOT NULL DEFAULT '0',
                    ADD "splitBatchByDistributor" smallint NOT NULL DEFAULT '0',
                    ADD "splitBatchByExpiryDate" smallint NOT NULL DEFAULT '0',
                    ADD "splitBatchByCostPrice" smallint NOT NULL DEFAULT '0'
            `)

        await queryRunner.query(`
            ALTER TABLE "Batch"
                ADD "costAmount" bigint NOT NULL DEFAULT '0';
            UPDATE  "Batch"
                SET "costAmount" = "costPrice" * "quantity";
        `)

        await queryRunner.query(`
            ALTER TABLE "StockCheckItem"
                ADD "systemCostAmount" bigint NOT NULL DEFAULT '0',
                ADD "actualCostAmount" bigint NOT NULL DEFAULT '0';
        `)

        await queryRunner.query(`
            ALTER TABLE "ProductMovement"
                ADD "costAmount" bigint NOT NULL DEFAULT '0';
            UPDATE  "ProductMovement"
                SET "costAmount" = "costPrice" * "quantity";
            ALTER TABLE "ProductMovement" DROP COLUMN "costPrice";
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketBatch"
                ADD "costAmount" bigint NOT NULL DEFAULT '0';
            UPDATE  "TicketBatch"
                SET "costAmount" = "costPrice" * "quantity";
            ALTER TABLE "TicketBatch" DROP COLUMN "costPrice";
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

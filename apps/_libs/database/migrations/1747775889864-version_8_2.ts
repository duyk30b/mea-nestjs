import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version821747775889864 implements MigrationInterface {
    name = 'Version821747775889864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Product" DROP COLUMN "hasManageQuantity";
            ALTER TABLE "Product"
                ADD "inventoryStrategy" smallint NOT NULL DEFAULT '-1'

        `)
        await queryRunner.query(`
            ALTER TABLE "TicketProduct"
                ADD "inventoryStrategy" smallint NOT NULL DEFAULT '2',
                ADD "batchId" integer NOT NULL DEFAULT '0',
                ADD "warehouseIds" character varying(50) NOT NULL DEFAULT '[0]';
            UPDATE "TicketProduct" 
                SET "warehouseIds" = '[' || "warehouseId" || ']';
            ALTER TABLE "TicketProduct" 
                DROP COLUMN "hasInventoryImpact",
                DROP COLUMN "warehouseId";
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

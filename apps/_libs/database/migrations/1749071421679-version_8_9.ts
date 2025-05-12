import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version891749071421679 implements MigrationInterface {
    name = 'Version891749071421679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ProductMovement" RENAME COLUMN "openQuantity" TO "openQuantityProduct";
            ALTER TABLE "ProductMovement" RENAME COLUMN "closeQuantity" TO "closeQuantityProduct";
            ALTER TABLE "ProductMovement" DROP COLUMN "unitRate";

            ALTER TABLE "ProductMovement"
                ADD "openQuantityBatch" numeric(10, 3) NOT NULL DEFAULT '0',
                ADD "closeQuantityBatch" numeric(10, 3) NOT NULL DEFAULT '0',
                ADD "openCostAmountBatch" bigint NOT NULL DEFAULT '0',
                ADD "closeCostAmountBatch" bigint NOT NULL DEFAULT '0';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

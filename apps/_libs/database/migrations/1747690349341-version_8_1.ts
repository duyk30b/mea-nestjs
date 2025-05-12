import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version811747690349341 implements MigrationInterface {
    name = 'Version811747690349341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Product" DROP CONSTRAINT "UNIQUE_Product__oid_code";
            ALTER TABLE "Product" RENAME COLUMN code TO "productCode";
            ALTER TABLE "Product"
                ALTER COLUMN "productCode" DROP DEFAULT;
            ALTER TABLE "Product" 
                ALTER COLUMN "productCode" TYPE varchar(50) USING "productCode"::varchar(50);
            ALTER TABLE "Product"
                ADD CONSTRAINT "UNIQUE_Product__oid_productCode" UNIQUE ("oid", "productCode");

        `)

        await queryRunner.query(`
            ALTER TABLE "Batch" DROP COLUMN "lotNumber";
            ALTER TABLE "Batch"
                ADD "batchCode" character varying(50) NOT NULL DEFAULT '';
        `)

        await queryRunner.query(`
            ALTER TABLE "ReceiptItem" DROP COLUMN "lotNumber";
            ALTER TABLE "ReceiptItem"
                ADD "batchCode" character varying(50) NOT NULL DEFAULT '';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

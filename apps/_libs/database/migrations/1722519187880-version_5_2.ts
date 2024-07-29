import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version521722519187880 implements MigrationInterface {
    name = 'Version521722519187880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Product"
            ADD "lotNumber" character varying(255) NOT NULL DEFAULT ''
        `)
        await queryRunner.query(`
            ALTER TABLE "Product"
            ADD "expiryDate" bigint
        `)
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
            ADD "lotNumber" character varying(255) NOT NULL DEFAULT ''
        `)
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
            ADD "expiryDate" bigint
        `)
        await queryRunner.query(`
            UPDATE  "Receipt" "receipt"
            SET     "debt" = "totalMoney" - "paid"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem" DROP COLUMN "expiryDate"
        `)
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem" DROP COLUMN "lotNumber"
        `)
        await queryRunner.query(`
            ALTER TABLE "Product" DROP COLUMN "expiryDate"
        `)
        await queryRunner.query(`
            ALTER TABLE "Product" DROP COLUMN "lotNumber"
        `)
    }
}

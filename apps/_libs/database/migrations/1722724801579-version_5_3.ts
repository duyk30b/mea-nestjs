import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version531722724801579 implements MigrationInterface {
    name = 'Version531722724801579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Organization"
                ADD "emailVerify" smallint NOT NULL DEFAULT '0',
                ADD "dataVersion" smallint NOT NULL DEFAULT '1'
            `)
        await queryRunner.query(`
            ALTER TABLE "Organization"
                ALTER COLUMN "email" DROP NOT NULL
        `)

        await queryRunner.query(`
            UPDATE "Product" product
            SET "expiryDate" = (
                SELECT MIN("expiryDate")
                FROM "Batch" batch
                WHERE   batch."productId" = product.id
                    AND batch."expiryDate" IS NOT NULL
                    AND batch."quantity" <> 0
            )
            WHERE product."hasManageBatches" = 1
        `)
        await queryRunner.query(`
            UPDATE  "TicketProduct" "tp"
            SET     "deliveryStatus" = "t"."deliveryStatus"
            FROM    "Ticket" "t"
            WHERE   "tp"."ticketId" = "t"."id"
                AND "t"."ticketStatus" IN (5,6,7)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Organization"
                ALTER COLUMN "email" SET NOT NULL
        `)
        await queryRunner.query(`
            ALTER TABLE "Organization" 
                DROP COLUMN "dataVersion",
                DROP COLUMN "emailVerify"
        `)
    }
}

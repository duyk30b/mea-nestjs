import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version421719673238905 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "VisitExpense" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "visitId" integer NOT NULL,
                "key" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "money" bigint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_4ecc7d5abc987f8dd1a789093c4" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_VisitExpense__visitId" ON "VisitExpense" ("oid", "visitId")
        `)
    await queryRunner.query(`
            CREATE TABLE "VisitSurcharge" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "visitId" integer NOT NULL,
                "key" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "money" bigint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_2534f0a527f29969f1d14de0dfc" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_VisitSurcharge__visitId" ON "VisitSurcharge" ("oid", "visitId")
        `)

    if ('Visit') {
      await queryRunner.query(`
            DROP INDEX "public"."IDX_Visit__oid_debt"
        `)
      await queryRunner.query(`
            ALTER TABLE "Visit"
                ADD "visitType" smallint NOT NULL DEFAULT '1',
                ADD "surcharge" bigint NOT NULL DEFAULT '0',
                ADD "expense" bigint NOT NULL DEFAULT '0',
                ADD "note" character varying(255)
        `)
      await queryRunner.query(`
            ALTER TABLE "Visit"
                ALTER COLUMN "visitStatus" SET DEFAULT '1'
        `)
      await queryRunner.query(`
            CREATE INDEX "IDX_Visit__oid_visitStatus" ON "Visit" ("oid", "visitStatus")
        `)
    }

    if ('Batch') {
      await queryRunner.query(`
            ALTER TABLE "Batch"
                ADD "wholesalePrice" bigint NOT NULL DEFAULT '0',
                ADD "retailPrice" bigint NOT NULL DEFAULT '0'
        `)
      await queryRunner.query(`
            UPDATE  "Batch" "batch"
            SET     "wholesalePrice" = product."wholesalePrice",
                    "retailPrice" = product."retailPrice"
            FROM    "Product" "product"
            WHERE   "batch"."productId" = "product"."id"
          `)
      await queryRunner.query(`
            DELETE FROM "Batch" 
            WHERE quantity = 0
                AND id NOT IN (
                    SELECT DISTINCT "batchId" FROM "ReceiptItem"
                    UNION
                    SELECT DISTINCT "batchId" FROM "InvoiceItem"
                    UNION
                    SELECT DISTINCT "batchId" FROM "BatchMovement"
                )
          `)
    }

    if ('ReceiptItem') {
      await queryRunner.query(`
          ALTER TABLE "ReceiptItem"
              ADD "wholesalePrice" bigint NOT NULL DEFAULT '0',
              ADD "retailPrice" bigint NOT NULL DEFAULT '0'
      `)
      await queryRunner.query(`
          UPDATE  "ReceiptItem" "ri"
          SET     "wholesalePrice" = product."wholesalePrice",
                  "retailPrice" = product."retailPrice"
          FROM    "Product" "product"
          WHERE   "ri"."productId" = "product"."id"
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

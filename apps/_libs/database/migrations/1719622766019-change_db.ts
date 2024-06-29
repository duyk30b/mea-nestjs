import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChangeDb1719622766019 implements MigrationInterface {
  name = 'ChangeDb1719622766019'

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
    await queryRunner.query(`
            ALTER TABLE "Visit"
            ADD "visitType" smallint NOT NULL DEFAULT '1'
        `)
    await queryRunner.query(`
            ALTER TABLE "Visit"
            ADD "surcharge" bigint NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "Visit"
            ADD "expense" bigint NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "Visit"
            ADD "note" character varying(255)
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_Batch__oid_updatedAt"
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_Batch__oid_updatedAt" ON "Batch" ("oid", "updatedAt")
        `)
    await queryRunner.query(`
            ALTER TABLE "Visit" DROP COLUMN "note"
        `)
    await queryRunner.query(`
            ALTER TABLE "Visit" DROP COLUMN "expense"
        `)
    await queryRunner.query(`
            ALTER TABLE "Visit" DROP COLUMN "surcharge"
        `)
    await queryRunner.query(`
            ALTER TABLE "Visit" DROP COLUMN "visitType"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_VisitSurcharge__visitId"
        `)
    await queryRunner.query(`
            DROP TABLE "VisitSurcharge"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_VisitExpense__visitId"
        `)
    await queryRunner.query(`
            DROP TABLE "VisitExpense"
        `)
  }
}

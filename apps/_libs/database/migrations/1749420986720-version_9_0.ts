import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version901749420986720 implements MigrationInterface {
  name = 'Version901749420986720'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const queryArray: string[] = []

    queryArray.push(`
      ALTER TABLE "Batch"
        ADD "isActive" smallint NOT NULL DEFAULT '1';

      ALTER TABLE "Batch"
        RENAME COLUMN "batchCode" TO "lotNumber";

      DELETE FROM "Batch"
      WHERE "productId" IS NOT NULL AND "productId" NOT IN (
        SELECT "id" FROM "Product"
      );
    `)

    queryArray.push(`
      ALTER TABLE "Product"
        ADD "productType" smallint NOT NULL DEFAULT '1';
      ALTER TABLE "Product" 
        DROP COLUMN "pickupStrategy";
    `)

    queryArray.push(`
      ALTER TABLE "ReceiptItem"
        RENAME COLUMN "batchCode" TO "lotNumber";

      UPDATE      "ReceiptItem" 
      SET         "listPrice" = "Product"."retailPrice"
      FROM        "Product" 
      WHERE       "ReceiptItem"."productId" = "Product"."id" 
      AND         "Product"."id" != 0;
    `)

    queryArray.push(`
      ALTER TABLE "LaboratoryKit" RENAME TO "LaboratorySample";
      ALTER SEQUENCE "LaboratoryKit_id_seq" RENAME TO "LaboratorySample_id_seq";
    `)

    queryArray.push(`
      DROP TABLE "Commission" CASCADE;
    `)
    queryArray.push(`
      CREATE TABLE "Position" (
        "oid" integer NOT NULL,
        "id" SERIAL NOT NULL,
        "roleId" integer NOT NULL,
        "positionInteractId" integer NOT NULL DEFAULT '0',
        "positionType" smallint NOT NULL DEFAULT '1',
        "commissionValue" numeric(10, 3) NOT NULL DEFAULT '0',
        "commissionCalculatorType" smallint NOT NULL DEFAULT '1',
        CONSTRAINT "PK_4c5179b1a25cf5c52157d2b2bf4" PRIMARY KEY ("id")
      );
    `)
    queryArray.push(`
      CREATE UNIQUE INDEX "IDX_Position__oid_roleId_positionType_positionInteractId" ON "Position" (
        "oid",
        "roleId",
        "positionType",
        "positionInteractId"
      );
    `)
    queryArray.push(`
      ALTER TABLE "TicketUser" 
        DROP COLUMN "interactType",
        DROP COLUMN "interactId";
      ALTER TABLE "TicketUser"
        ADD "positionType" smallint NOT NULL DEFAULT '1',
        ADD "positionInteractId" integer NOT NULL DEFAULT '0';
    `)
    await queryRunner.query(queryArray.join(''))
  }

  public async down(queryRunner: QueryRunner): Promise<void> { }
}

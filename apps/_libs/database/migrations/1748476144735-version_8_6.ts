import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version861748476144735 implements MigrationInterface {
    name = 'Version861748476144735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "StockCheckItem" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "stockCheckId" integer NOT NULL,
                "productId" integer NOT NULL DEFAULT '0',
                "batchId" integer NOT NULL,
                "systemQuantity" numeric(10, 3) NOT NULL DEFAULT '0',
                "actualQuantity" numeric(10, 3) NOT NULL DEFAULT '0',
                "note" character varying(255),
                CONSTRAINT "PK_c77cc23479372b8b72fecf14904" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_StockCheckItem__oid_stockCheckId" ON "StockCheckItem" ("oid", "stockCheckId");
        `)

        await queryRunner.query(`
            CREATE TABLE "StockCheck" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "createdAt" bigint NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                "createdByUserId" integer NOT NULL,
                "updatedByUserId" integer NOT NULL,
                "status" smallint NOT NULL,
                "note" character varying(255),
                CONSTRAINT "PK_9c425ce63ed3437e5ad410a04d0" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_StockCheck__oid_createdAt" ON "StockCheck" ("oid", "createdAt");
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

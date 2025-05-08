import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version821746587485227 implements MigrationInterface {
    name = 'Version821746587485227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Product"
                ADD "code" integer NOT NULL DEFAULT '0';

            WITH ranked AS (
            SELECT
                id,
                oid,
                ROW_NUMBER() OVER (PARTITION BY oid ORDER BY id) AS new_code
            FROM "Product"
            )
            UPDATE "Product"
            SET code = ranked.new_code
            FROM ranked
            WHERE "Product".id = ranked.id;

            ALTER TABLE "Product"
                ADD CONSTRAINT "UNIQUE_Product__oid_code" UNIQUE ("oid", "code");
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}
